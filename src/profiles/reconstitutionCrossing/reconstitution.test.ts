import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { compileAct } from "../bookOfActs/compileAct";
import { GROCERY_DELIVERY_ACT_V0 } from "../bookOfActs/fixtures";
import type { ParticularActV0 } from "../bookOfActs/types";
import {
  createReconstitutionSeed,
  evaluateAction,
  hatchSeed,
  RECONSTITUTION_NON_CLAIMS,
} from "./reconstitution";

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

const cargo = {
  instructions: [
    "read the bounded grocery request",
    "distinguish unknown from unavailable",
    "never silently substitute",
    "preserve partial fulfillment and residuals",
  ],
  capabilityRefs: ["capability:grocery-helper-v0"],
  schemaRefs: [
    "schema:request",
    "schema:availability",
    "schema:fulfillment",
    "schema:residual",
  ],
  testRefs: [
    "test:unavailable-item",
    "test:duplicate-request",
    "test:refused-substitution",
  ],
  exampleActRefs: [GROCERY_DELIVERY_ACT_V0.actId],
  formationTrace: [...GROCERY_DELIVERY_ACT_V0.residualFog],
};

async function makeSeed(transportedAuthorityClaims: string[] = []) {
  const receipt = await compileAct(GROCERY_DELIVERY_ACT_V0);
  return createReconstitutionSeed({
    act: GROCERY_DELIVERY_ACT_V0,
    receipt,
    cargo,
    transportedAuthorityClaims,
  });
}

await test("verified Book of Acts receipt can become attributable seed cargo", async () => {
  const receipt = await compileAct(GROCERY_DELIVERY_ACT_V0);
  const seed = await createReconstitutionSeed({
    act: GROCERY_DELIVERY_ACT_V0,
    receipt,
    cargo,
  });

  assert.equal(seed.sourceActId, GROCERY_DELIVERY_ACT_V0.actId);
  assert.equal(seed.sourceActDigest, receipt.actDigest);
  assert.deepEqual(seed.sourceReceiptRefs, [receipt.receiptId]);
  assert.deepEqual(seed.cargo.formationTrace, GROCERY_DELIVERY_ACT_V0.residualFog);
  assert.ok(seed.doesNotClaim.includes("seed != authority"));
  assert.ok(seed.doesNotClaim.includes("reconstitution != inherited legitimacy"));
});

await test("tampered particular cannot mint a crossing seed from an old receipt", async () => {
  const receipt = await compileAct(GROCERY_DELIVERY_ACT_V0);
  const tampered = structuredClone(GROCERY_DELIVERY_ACT_V0) as ParticularActV0;
  tampered.residualFog.push("invented after the receipt");

  await assert.rejects(
    () => createReconstitutionSeed({ act: tampered, receipt, cargo }),
    /SOURCE_RECEIPT_NOT_VALID/,
  );
});

await test("same seed can hatch distinct new particulars", async () => {
  const seed = await makeSeed();

  const first = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:001",
    environmentRef: "environment:A",
    targetRef: "grocery-request:42",
    localAdmissions: [{
      admissionRef: "admission:A",
      capabilityRef: "capability:grocery-helper-v0",
    }],
  });

  const second = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:002",
    environmentRef: "environment:A",
    targetRef: "grocery-request:42",
    localAdmissions: [{
      admissionRef: "admission:B",
      capabilityRef: "capability:grocery-helper-v0",
    }],
  });

  assert.notEqual(first.eventId, second.eventId);
  assert.notEqual(first.resultingParticularRef, second.resultingParticularRef);
  assert.equal(first.identityRelation, "new-particular");
  assert.equal(first.claims.identityContinued, false);
});

await test("admitted capability without local authority remains blocked", async () => {
  const seed = await makeSeed();

  const event = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:no-authority",
    environmentRef: "environment:B",
    targetRef: "grocery-request:43",
    localAdmissions: [{
      admissionRef: "admission:grocery-helper",
      capabilityRef: "capability:grocery-helper-v0",
    }],
  });

  const decision = evaluateAction(event, {
    capabilityRef: "capability:grocery-helper-v0",
    action: "purchase-groceries",
  });

  assert.equal(decision.capability, "available");
  assert.equal(decision.authority, "absent");
  assert.equal(decision.action, "blocked");
  assert.deepEqual(event.effectiveAuthorityGrants, []);
});

await test("forged authority carried in the seed gains zero destination power", async () => {
  const seed = await makeSeed([
    "authority:granted",
    "purchase-groceries",
    "publish-history",
  ]);

  const event = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:forged-authority",
    environmentRef: "environment:C",
    targetRef: "grocery-request:44",
    localAdmissions: [{
      admissionRef: "admission:grocery-helper",
      capabilityRef: "capability:grocery-helper-v0",
    }],
  });

  const decision = evaluateAction(event, {
    capabilityRef: "capability:grocery-helper-v0",
    action: "purchase-groceries",
  });

  assert.ok(event.transportedAuthorityClaims.includes("authority:granted"));
  assert.deepEqual(event.effectiveAuthorityGrants, []);
  assert.equal(event.claims.authorityInherited, false);
  assert.equal(decision.action, "blocked");
});

await test("local grant can permit only the locally admitted action", async () => {
  const seed = await makeSeed(["purchase-groceries"]);

  const event = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:local-grant",
    environmentRef: "environment:D",
    targetRef: "grocery-request:45",
    localAdmissions: [{
      admissionRef: "admission:grocery-helper",
      capabilityRef: "capability:grocery-helper-v0",
    }],
    localAuthorityGrants: [{
      grantRef: "grant:purchase-45",
      action: "purchase-groceries",
      targetRef: "grocery-request:45",
    }],
  });

  const purchase = evaluateAction(event, {
    capabilityRef: "capability:grocery-helper-v0",
    action: "purchase-groceries",
  });
  const publish = evaluateAction(event, {
    capabilityRef: "capability:grocery-helper-v0",
    action: "publish-history",
  });

  assert.equal(purchase.authority, "locally-granted");
  assert.equal(purchase.action, "permitted");
  assert.equal(purchase.matchedGrantRef, "grant:purchase-45");
  assert.equal(publish.action, "blocked");
});

await test("same seed in a different environment produces a different event", async () => {
  const seed = await makeSeed();

  const left = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:environment-test",
    environmentRef: "environment:left",
    targetRef: "grocery-request:46",
  });
  const right = await hatchSeed({
    seed,
    hatchOccurrenceRef: "hatch:environment-test",
    environmentRef: "environment:right",
    targetRef: "grocery-request:46",
  });

  assert.notEqual(left.eventId, right.eventId);
});

await test("tampered seed is rejected before hatch", async () => {
  const seed = await makeSeed();
  seed.cargo.instructions.push("silently substitute");

  await assert.rejects(
    () => hatchSeed({
      seed,
      hatchOccurrenceRef: "hatch:tampered",
      environmentRef: "environment:E",
      targetRef: "grocery-request:47",
    }),
    /SEED_IDENTITY_MISMATCH/,
  );
});

await test("unknown capability cannot be locally admitted through this seed", async () => {
  const seed = await makeSeed();

  await assert.rejects(
    () => hatchSeed({
      seed,
      hatchOccurrenceRef: "hatch:unknown-capability",
      environmentRef: "environment:F",
      targetRef: "grocery-request:48",
      localAdmissions: [{
        admissionRef: "admission:invented",
        capabilityRef: "capability:not-in-seed",
      }],
    }),
    /LOCAL_ADMISSION_REFERENCES_UNKNOWN_CAPABILITY/,
  );
});

await test("scope file freezes non-authority boundary", async () => {
  const raw = await readFile(
    new URL("../../../evidence/reconstitution-crossing-v0-scope.json", import.meta.url),
    "utf8",
  );
  const scope = JSON.parse(raw);

  assert.equal(scope.profile, "nuthang/reconstitution-crossing/v0");
  assert.ok(scope.does_not_claim.includes("identity continuity"));
  assert.ok(scope.does_not_claim.includes("authority transit"));
  assert.ok(scope.does_not_claim.includes("AI training consent"));
  assert.deepEqual([...RECONSTITUTION_NON_CLAIMS].sort(), scope.runtime_non_claims.sort());
});

process.exitCode = failures === 0 ? 0 : 1;
