import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  canonicalJson,
  canonicalizeParticularAct,
  sha256Content,
} from "./canonicalize";
import type { ParticularActV0 } from "./types";
import {
  BOOK_OF_ACTS_NON_CLAIMS,
  compileAct,
} from "./compileAct";

let failures = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

const baseAct: ParticularActV0 = {
  schema: "nuthang.particular-act/0.1",
  actId: "act:grocery-delivery-001",
  subject: { kind: "community-need", ref: "need:grocery-delivery-001" },
  needRefs: ["need:grocery-delivery-001"],
  offerRefs: ["offer:food", "offer:vehicle", "offer:time"],
  joinRefs: ["join:c", "join:a", "join:b"],
  participants: [
    { actorRef: "human:b", declaredCapacity: "food", contributionRefs: ["offer:food"] },
    { actorRef: "human:a", declaredCapacity: "driver", contributionRefs: ["offer:vehicle"] },
    { actorRef: "human:c", declaredCapacity: "volunteer", contributionRefs: ["offer:time"] },
  ],
  occurrences: [
    {
      occurrenceRef: "occurrence:pickup",
      kind: "pickup",
      evidenceClass: "observed",
      sourceRefs: ["witness:pickup"],
    },
    {
      occurrenceRef: "occurrence:delivery",
      kind: "delivery",
      evidenceClass: "reported",
      sourceRefs: ["report:recipient"],
    },
  ],
  constraints: [
    {
      constraintRef: "constraint:item-unavailable",
      kind: "item-unavailable",
      sourceRefs: ["report:store"],
    },
  ],
  artifactRefs: ["artifact:shopping-list"],
  witnessRefs: ["witness:recipient", "witness:driver"],
  disposition: "scoped_complete",
  residualFog: ["requested item unavailable; scope allowed explicit exception"],
  disclosure: {
    communityMemory: "named-circle",
    aiTraining: "not-granted",
  },
  temporalBinding: {
    subjectOccurrenceRef: "time:subject-001",
    declarationOccurrenceRef: "time:declaration-001",
    applicationOccurrenceRef: "time:application-001",
    relation: "contemporaneous-attested",
  },
};

await test("canonicalization sorts set-like references and participants", () => {
  const normalized = canonicalizeParticularAct(baseAct);
  assert.deepEqual(normalized.joinRefs, ["join:a", "join:b", "join:c"]);
  assert.deepEqual(
    normalized.participants.map((item) => item.actorRef),
    ["human:a", "human:b", "human:c"],
  );
  assert.deepEqual(normalized.occurrences.map((item) => item.occurrenceRef), [
    "occurrence:pickup",
    "occurrence:delivery",
  ]);
});

await test("canonical JSON ignores object key insertion order", () => {
  assert.equal(
    canonicalJson({ b: 2, a: 1 }),
    canonicalJson({ a: 1, b: 2 }),
  );
});

await test("Book of Acts uses real SHA-256 content addresses", async () => {
  const digest = await sha256Content({ hello: "world" });
  assert.match(digest, /^sha256:[0-9a-f]{64}$/);
});

await test("same particular produces the same receipt identity", async () => {
  const first = await compileAct(baseAct);
  const second = await compileAct(structuredClone(baseAct));

  assert.equal(first.receiptId, second.receiptId);
  assert.equal(first.actDigest, second.actDigest);
});

await test("set-like input ordering does not change the receipt", async () => {
  const reordered = structuredClone(baseAct);
  reordered.joinRefs.reverse();
  reordered.participants.reverse();
  reordered.witnessRefs.reverse();

  assert.equal(
    (await compileAct(baseAct)).receiptId,
    (await compileAct(reordered)).receiptId,
  );
});

await test("changing a real particular changes the receipt", async () => {
  const changed = structuredClone(baseAct);
  changed.constraints[0].kind = "cold-storage-unavailable";

  assert.notEqual(
    (await compileAct(baseAct)).receiptId,
    (await compileAct(changed)).receiptId,
  );
});

await test("receipt carries explicit non-claims", async () => {
  const receipt = await compileAct(baseAct);
  assert.deepEqual(receipt.doesNotClaim, BOOK_OF_ACTS_NON_CLAIMS);
  assert.ok(receipt.doesNotClaim.includes("receipt != human worth"));
  assert.ok(receipt.doesNotClaim.includes("receipt != token entitlement"));
  assert.ok(receipt.doesNotClaim.includes("receipt != AI training consent"));
});

await test("reported evidence stays reported", async () => {
  const receipt = await compileAct(baseAct);
  assert.equal(baseAct.occurrences[1].evidenceClass, "reported");
  assert.equal(receipt.claims.admittedParticularDigest, true);
});

await test("training permission cannot be granted in v0 ParticularAct", async () => {
  const invalid = structuredClone(baseAct) as ParticularActV0 & {
    disclosure: { communityMemory: "named-circle"; aiTraining: string };
  };
  invalid.disclosure.aiTraining = "granted";

  await assert.rejects(() => compileAct(invalid as ParticularActV0), /aiTraining/);
});


import { closeNuBlock } from "./nuBlock";

await test("nuBlock closes only with explicit disposition", async () => {
  const receipt = await compileAct(baseAct);
  const block = await closeNuBlock({
    subjectRef: baseAct.subject.ref,
    receipts: [receipt],
    artifactRefs: baseAct.artifactRefs,
    disposition: "scoped_complete",
    residualFog: baseAct.residualFog,
  });

  assert.equal(block.disposition, "scoped_complete");
  assert.deepEqual(block.actReceiptRefs, [receipt.receiptId]);
});

await test("changing block disposition changes block identity", async () => {
  const receipt = await compileAct(baseAct);
  const common = {
    subjectRef: baseAct.subject.ref,
    receipts: [receipt],
    artifactRefs: baseAct.artifactRefs,
    residualFog: baseAct.residualFog,
  };

  const completed = await closeNuBlock({ ...common, disposition: "scoped_complete" });
  const partial = await closeNuBlock({ ...common, disposition: "partial" });
  assert.notEqual(completed.blockId, partial.blockId);
});

await test("nuBlock refuses empty receipt history", async () => {
  await assert.rejects(() => closeNuBlock({
    subjectRef: baseAct.subject.ref,
    receipts: [],
    artifactRefs: [],
    disposition: "unresolved",
    residualFog: [],
  }), /at least one ActReceipt/);
});


import { verifyActReceipt } from "./verifyReceipt";
import { GROCERY_DELIVERY_ACT_V0, retrospectiveGroceryAct } from "./fixtures";

await test("independent verifier reproduces a valid receipt", async () => {
  const receipt = await compileAct(baseAct);
  const result = await verifyActReceipt(receipt, baseAct);

  assert.equal(result.status, "VALID");
  assert.equal(result.checks.actDigestMatches, true);
  assert.equal(result.checks.receiptIdMatches, true);
  assert.equal(result.checks.compilerIdentityMatches, true);
});

await test("tampered particular is a mismatch", async () => {
  const receipt = await compileAct(baseAct);
  const tampered = structuredClone(baseAct);
  tampered.residualFog.push("invented later");

  const result = await verifyActReceipt(receipt, tampered);
  assert.equal(result.status, "MISMATCH");
  assert.equal(result.checks.actDigestMatches, false);
});

await test("verification is read-only", async () => {
  const act = structuredClone(baseAct);
  const receipt = await compileAct(act);
  const beforeAct = JSON.stringify(act);
  const beforeReceipt = JSON.stringify(receipt);

  await verifyActReceipt(receipt, act);

  assert.equal(JSON.stringify(act), beforeAct);
  assert.equal(JSON.stringify(receipt), beforeReceipt);
});

await test("grocery specimen has no economic or training grant", () => {
  assert.equal(GROCERY_DELIVERY_ACT_V0.disclosure.aiTraining, "not-granted");
  assert.equal("economicProjection" in GROCERY_DELIVERY_ACT_V0, false);
});

await test("same summary but different particulars has different identity", async () => {
  const left = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  const right = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  right.constraints[0].kind = "refrigeration-gap";

  assert.notEqual(
    (await compileAct(left)).receiptId,
    (await compileAct(right)).receiptId,
  );
});

await test("removing residual fog changes receipt identity", async () => {
  const clear = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  clear.residualFog = [];

  assert.notEqual(
    (await compileAct(GROCERY_DELIVERY_ACT_V0)).receiptId,
    (await compileAct(clear)).receiptId,
  );
});

await test("retrospective binding cannot masquerade as contemporaneous", async () => {
  const contemporary = await compileAct(GROCERY_DELIVERY_ACT_V0);
  const retrospective = await compileAct(retrospectiveGroceryAct());

  assert.notEqual(contemporary.receiptId, retrospective.receiptId);
  assert.equal(retrospective.temporalBinding.relation, "retrospective");
  assert.notEqual(
    retrospective.temporalBinding.subjectOccurrenceRef,
    retrospective.temporalBinding.declarationOccurrenceRef,
  );
});

await test("witness count grants no authority field", async () => {
  const manyWitnesses = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  manyWitnesses.witnessRefs = Array.from(
    { length: 100 },
    (_, index) => `witness:${index}`,
  );

  const receipt = await compileAct(manyWitnesses);
  assert.equal("authority" in receipt, false);
  assert.ok(receipt.doesNotClaim.includes("receipt != authority"));
});

await test("partial completion remains history", async () => {
  const partial = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  partial.disposition = "partial";

  const receipt = await compileAct(partial);
  const block = await closeNuBlock({
    subjectRef: partial.subject.ref,
    receipts: [receipt],
    artifactRefs: partial.artifactRefs,
    disposition: "partial",
    residualFog: partial.residualFog,
  });

  assert.equal(receipt.disposition, "partial");
  assert.equal(block.disposition, "partial");
});

await test("Book of Acts evidence scope preserves non-authority claims", async () => {
  const raw = await readFile(
    new URL("../../../evidence/book-of-acts-v0-scope.json", import.meta.url),
    "utf8",
  );
  const scope = JSON.parse(raw);

  assert.equal(scope.profile, "nuthang/book-of-acts/v0");
  assert.ok(scope.does_not_claim.includes("human worth"));
  assert.ok(scope.does_not_claim.includes("economic value"));
  assert.ok(scope.does_not_claim.includes("AI training consent"));
});

import { prepareHelpCaseActDraft } from "./helpCaseAdapter";

const helpCasePacket = {
  schema: "help-case-status/v0" as const,
  caseId: "help-case:abc",
  sourceEnvelopeId: "env-1",
  sourcePayloadHash: "sha256:abc",
  projectedAt: "2026-09-18T16:30:00.000Z",
  projectionCut: {
    eventRefs: ["report-1", "confirm-1"],
    occurrences: [
      {
        eventRef: "report-1",
        type: "delivery.reported",
        occurredAt: "2026-09-18T16:20:00.000Z",
      },
      {
        eventRef: "confirm-1",
        type: "receipt.confirmed",
        occurredAt: "2026-09-18T16:25:00.000Z",
      },
    ],
  },
  requirements: [{
    requirementId: "ingredient:beans",
    description: "Beans",
    unit: "can",
    requestedQuantity: 4,
    confirmedReceivedQuantity: 2,
    resolvedElsewhereQuantity: 0,
    waivedQuantity: 0,
    confirmedResidualQuantity: 2,
    excessResolvedQuantity: 0,
    qualitativeResolved: false,
    warnings: [],
  }],
};

await test("help-case adapter accepts only a selected receipt confirmation", () => {
  assert.throws(
    () => prepareHelpCaseActDraft({
      packet: helpCasePacket,
      requirementId: "ingredient:beans",
      confirmationOccurrenceRef: "report-1",
      actId: "act:help-case-1",
      subjectOccurrenceRef: "request:env-1",
    }),
    /BOOK_OF_ACTS_REQUIRES_CONFIRMED_RECEIPT_OCCURRENCE/,
  );
});

await test("help-case adapter prepares a partial act without compiling it", () => {
  const candidate = prepareHelpCaseActDraft({
    packet: helpCasePacket,
    requirementId: "ingredient:beans",
    confirmationOccurrenceRef: "confirm-1",
    actId: "act:help-case-1",
    subjectOccurrenceRef: "request:env-1",
    participants: [{
      actorRef: "human:helper",
      declaredCapacity: "neighbor",
      contributionRefs: [],
    }],
    witnessRefs: ["human:recipient"],
    communityMemory: "named-circle",
  });

  assert.equal(candidate.status, "human-review-required");
  assert.equal(candidate.compilationPerformed, false);
  assert.equal(candidate.particular.disposition, "partial");
  assert.equal(candidate.particular.occurrences[0].evidenceClass, "reported");
  assert.equal(candidate.particular.disclosure.aiTraining, "not-granted");
  assert.equal(candidate.particular.temporalBinding.relation, "unresolved");
  assert.ok(candidate.particular.residualFog.some((value) => value.includes("2 can")));
  assert.equal("receiptId" in candidate, false);
});

await test("help-case adapter may scope-complete only the selected requirement", () => {
  const completePacket = structuredClone(helpCasePacket);
  completePacket.requirements[0].confirmedReceivedQuantity = 4;
  completePacket.requirements[0].confirmedResidualQuantity = 0;

  const candidate = prepareHelpCaseActDraft({
    packet: completePacket,
    requirementId: "ingredient:beans",
    confirmationOccurrenceRef: "confirm-1",
    actId: "act:help-case-complete",
    subjectOccurrenceRef: "request:env-1",
  });

  assert.equal(candidate.particular.disposition, "scoped_complete");
  assert.equal(candidate.particular.subject.kind, "community-help-requirement");
  assert.equal(candidate.compilationPerformed, false);
});

process.exitCode = failures === 0 ? 0 : 1;
