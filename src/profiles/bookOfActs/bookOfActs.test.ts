import assert from "node:assert/strict";

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

process.exitCode = failures === 0 ? 0 : 1;
