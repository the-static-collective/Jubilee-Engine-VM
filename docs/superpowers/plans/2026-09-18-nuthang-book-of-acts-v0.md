# nuThang Book of Acts v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first executable Book of Acts profile inside Jubilee Engine VM: deterministic preservation of one bounded `ParticularActV0`, a content-addressed `ActReceiptV0`, bounded `nuBlock` closure, and independent receipt verification with hostile controls.

**Architecture:** Add an isolated `src/profiles/bookOfActs/` module that reuses the VM's `CompilerIdentity` shape but does not reuse the legacy pseudo-SHA `hashString()`. Book of Acts gets its own canonical normalization plus real SHA-256 content addressing through Web Crypto. The first slice is intentionally local and deterministic: no wallets, tokens, markets, distributed consensus, capacity scores, BODY integration, Campfire runtime integration, Human Witness runtime integration, or AI training code.

**Tech Stack:** TypeScript 5.8, Node/Web Crypto `crypto.subtle`, `tsx` for the zero-new-dependency test runner, existing Jubilee Engine VM `CompilerIdentity`.

**Spec:** `docs/superpowers/specs/2026-09-18-nuthang-book-of-acts-v0-design.md`

## Global Constraints

- `THE PARTICULAR SURVIVES EVERY PROJECTION`.
- `ACT != VALUE`.
- `CONTRIBUTION != HUMAN WORTH`.
- `RECEIPT != TOKEN`.
- `TOKEN != MONEY`.
- `CAPACITY != STATUS`.
- `CONSENSUS ON OCCURRENCE != CONSENSUS ON MEANING`.
- `COMMUNITY MEMORY != AI TRAINING CONSENT`.
- `ECONOMIC PROJECTION != HISTORICAL LEDGER`.
- `PROOF OF ACT != PROOF OF GOOD PERSON`.
- No production token issuance, wallets, markets, mining/staking, distributed consensus, model training, human-worth scoring, global identity, or public-chain publishing in v0.
- No Book of Acts function may silently upgrade `reported`, `derived`, or `unresolved` evidence to `observed`.
- No receipt or block identity may depend on wall-clock time.
- Book of Acts content addresses MUST use real SHA-256. Do not alter legacy Jubilee receipt identities as part of this slice.
- Arrays whose order is not semantically meaningful MUST be normalized before hashing. Chronological/semantic sequences MUST preserve their declared order.
- Refusal, partial completion, and unresolved state are first-class history, never absence.
- Community-memory permission MUST NOT imply AI-training permission.
- A later declaration applied to an earlier subject occurrence MUST remain distinguishable from a contemporaneous declaration.
- All new behavior follows TDD: write a failing assertion, run it and observe the expected failure, then implement the minimum code that makes it pass.

---

## File structure

Create a narrow profile rather than extending the existing 27K-line `src/lib/jubilee.ts`.

```text
src/
  profiles/
    bookOfActs/
      types.ts          domain/profile types and fixed non-authority vocabulary
      canonicalize.ts   normalization + canonical JSON + Web Crypto SHA-256
      compileAct.ts     validation + ActReceipt compilation
      nuBlock.ts        bounded block closure
      verifyReceipt.ts  independent read-only receipt verifier
      fixtures.ts       grocery-delivery fixture and hostile fixture builders
      bookOfActs.test.ts
```

Modify only:

```text
package.json
```

for a dedicated `test:book-of-acts` script.

Do not change `src/lib/jubilee.ts` or `src/lib/verifyReceipts.ts` in this slice unless implementation proves an unavoidable generic defect. If that occurs, stop and open a separate compatibility decision rather than silently changing old receipt identity.

---

### Task 1: Establish the Book of Acts type boundary and real content addressing

**Files:**
- Create: `src/profiles/bookOfActs/types.ts`
- Create: `src/profiles/bookOfActs/canonicalize.ts`
- Create: `src/profiles/bookOfActs/bookOfActs.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing `CompilerIdentity` type from `src/lib/jubilee.ts`.
- Produces:
  - `EvidenceClassV0`
  - `ActDispositionV0`
  - `DisclosurePolicyV0`
  - `TemporalBindingV0`
  - `ParticularActV0`
  - `canonicalizeParticularAct(act): ParticularActV0`
  - `canonicalJson(value): string`
  - `sha256Content(value): Promise<string>`

- [ ] **Step 1: Add the dedicated test command and write the first failing canonicalization/hash assertions**

Add to `package.json`:

```json
{
  "scripts": {
    "test:book-of-acts": "tsx src/profiles/bookOfActs/bookOfActs.test.ts"
  }
}
```

Create `bookOfActs.test.ts` with a minimal runner using Node's built-in assertion API:

```ts
import assert from "node:assert/strict";

import {
  canonicalJson,
  canonicalizeParticularAct,
  sha256Content,
} from "./canonicalize";
import type { ParticularActV0 } from "./types";

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

process.exitCode = failures === 0 ? 0 : 1;
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm run test:book-of-acts
```

Expected: FAIL because `./canonicalize` and `./types` do not exist.

- [ ] **Step 3: Implement the minimal profile types**

Create `types.ts`:

```ts
import type { CompilerIdentity } from "../../lib/jubilee";

export type EvidenceClassV0 =
  | "observed"
  | "reported"
  | "derived"
  | "unresolved";

export type ActDispositionV0 =
  | "attempted"
  | "partial"
  | "scoped_complete"
  | "refused"
  | "composted"
  | "unresolved";

export type DisclosurePolicyV0 = {
  communityMemory: "local" | "named-circle" | "public";
  aiTraining: "not-granted";
};

export type TemporalBindingV0 = {
  subjectOccurrenceRef: string;
  declarationOccurrenceRef?: string;
  applicationOccurrenceRef: string;
  relation: "contemporaneous-attested" | "retrospective" | "unresolved";
};

export type ParticularActV0 = {
  schema: "nuthang.particular-act/0.1";
  actId: string;
  subject: { kind: string; ref: string };
  needRefs: string[];
  offerRefs: string[];
  joinRefs: string[];
  participants: Array<{
    actorRef: string;
    declaredCapacity?: string;
    contributionRefs: string[];
  }>;
  occurrences: Array<{
    occurrenceRef: string;
    kind: string;
    evidenceClass: EvidenceClassV0;
    sourceRefs: string[];
  }>;
  constraints: Array<{
    constraintRef: string;
    kind: string;
    sourceRefs: string[];
  }>;
  artifactRefs: string[];
  witnessRefs: string[];
  disposition: ActDispositionV0;
  residualFog: string[];
  disclosure: DisclosurePolicyV0;
  temporalBinding: TemporalBindingV0;
};

export type ActReceiptV0 = {
  schema: "nuthang.act-receipt/0.1";
  receiptId: string;
  actDigest: string;
  profile: "nuthang/book-of-acts/v0";
  compilerIdentity: CompilerIdentity;
  compilerIdentityDigest: string;
  participantRefs: string[];
  witnessRefs: string[];
  sourceRefs: string[];
  disposition: ActDispositionV0;
  temporalBinding: TemporalBindingV0;
  previousReceiptRefs: string[];
  claims: {
    admittedParticularDigest: true;
    deterministicIdentity: true;
  };
  doesNotClaim: string[];
};
```

- [ ] **Step 4: Implement canonical normalization and Web Crypto SHA-256**

Create `canonicalize.ts`:

```ts
import type { ParticularActV0 } from "./types";

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;

  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
    .join(",")}}`;
}

function sorted(values: string[]): string[] {
  return [...values].sort();
}

export function canonicalizeParticularAct(act: ParticularActV0): ParticularActV0 {
  return {
    ...structuredClone(act),
    needRefs: sorted(act.needRefs),
    offerRefs: sorted(act.offerRefs),
    joinRefs: sorted(act.joinRefs),
    participants: act.participants
      .map((participant) => ({
        ...participant,
        contributionRefs: sorted(participant.contributionRefs),
      }))
      .sort((a, b) => a.actorRef.localeCompare(b.actorRef)),
    // occurrence order is semantically preserved
    occurrences: act.occurrences.map((occurrence) => ({
      ...occurrence,
      sourceRefs: sorted(occurrence.sourceRefs),
    })),
    constraints: act.constraints
      .map((constraint) => ({
        ...constraint,
        sourceRefs: sorted(constraint.sourceRefs),
      }))
      .sort((a, b) => a.constraintRef.localeCompare(b.constraintRef)),
    artifactRefs: sorted(act.artifactRefs),
    witnessRefs: sorted(act.witnessRefs),
    residualFog: [...act.residualFog],
  };
}

export async function sha256Content(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `sha256:${hex}`;
}
```

- [ ] **Step 5: Run the Book of Acts test and lint**

Run:

```bash
npm run test:book-of-acts
npm run lint
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add package.json src/profiles/bookOfActs/types.ts src/profiles/bookOfActs/canonicalize.ts src/profiles/bookOfActs/bookOfActs.test.ts
git commit -m "feat: establish Book of Acts particular identity"
```

---

### Task 2: Compile deterministic ActReceiptV0 without assigning value or authority

**Files:**
- Create: `src/profiles/bookOfActs/compileAct.ts`
- Modify: `src/profiles/bookOfActs/bookOfActs.test.ts`

**Interfaces:**
- Consumes:
  - `ParticularActV0`
  - existing `CompilerIdentity`
  - `canonicalizeParticularAct`
  - `sha256Content`
- Produces:
  - `BOOK_OF_ACTS_PROFILE`
  - `BOOK_OF_ACTS_COMPILER_IDENTITY`
  - `BOOK_OF_ACTS_NON_CLAIMS`
  - `validateParticularAct(act): string[]`
  - `compileAct(act, options?): Promise<ActReceiptV0>`

- [ ] **Step 1: Add failing receipt tests**

Append tests that specify the public API before implementation:

```ts
import {
  BOOK_OF_ACTS_NON_CLAIMS,
  compileAct,
} from "./compileAct";

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
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm run test:book-of-acts
```

Expected: FAIL because `compileAct.ts` does not exist.

- [ ] **Step 3: Implement validation constants and compiler identity**

Create `compileAct.ts` with fixed profile identity:

```ts
import type { CompilerIdentity } from "../../lib/jubilee";
import { canonicalizeParticularAct, sha256Content } from "./canonicalize";
import type { ActReceiptV0, ParticularActV0 } from "./types";

export const BOOK_OF_ACTS_PROFILE = "nuthang/book-of-acts/v0" as const;

export const BOOK_OF_ACTS_COMPILER_IDENTITY: CompilerIdentity = Object.freeze({
  compiler_name: "JubileeBookOfActsCompiler",
  compiler_version: "0.1.0",
  compiler_hash: "profile:book-of-acts/compiler/0.1.0",
  policy_engine_hash: "profile:book-of-acts/admission/0.1.0",
  schema_hash: "nuthang.particular-act/0.1",
  adapter_map_version: "none",
  adapter_map_hash: "none",
});

export const BOOK_OF_ACTS_NON_CLAIMS = Object.freeze([
  "receipt != human worth",
  "receipt != legal validity",
  "receipt != economic value",
  "receipt != token entitlement",
  "receipt != authority",
  "receipt != consensus on meaning",
  "receipt != AI training consent",
] as const);
```

Implement `validateParticularAct` with these minimum failures:

```ts
export function validateParticularAct(act: ParticularActV0): string[] {
  const errors: string[] = [];

  if (act.schema !== "nuthang.particular-act/0.1") errors.push("invalid schema");
  if (!act.actId.trim()) errors.push("actId must be non-empty");
  if (!act.subject.kind.trim()) errors.push("subject.kind must be non-empty");
  if (!act.subject.ref.trim()) errors.push("subject.ref must be non-empty");
  if (!act.temporalBinding.subjectOccurrenceRef.trim()) errors.push("subjectOccurrenceRef must be non-empty");
  if (!act.temporalBinding.applicationOccurrenceRef.trim()) errors.push("applicationOccurrenceRef must be non-empty");
  if (
    act.temporalBinding.relation === "contemporaneous-attested" &&
    !act.temporalBinding.declarationOccurrenceRef?.trim()
  ) {
    errors.push("contemporaneous-attested requires declarationOccurrenceRef");
  }
  if (act.disclosure.aiTraining !== "not-granted") {
    errors.push("aiTraining must remain not-granted in Book of Acts v0");
  }

  return errors;
}
```

Implement `compileAct` so the receipt ID hashes the receipt body without `receiptId`:

```ts
export async function compileAct(
  act: ParticularActV0,
  options: {
    compilerIdentity?: CompilerIdentity;
    previousReceiptRefs?: string[];
  } = {},
): Promise<ActReceiptV0> {
  const errors = validateParticularAct(act);
  if (errors.length) throw new Error(errors.join("; "));

  const normalized = canonicalizeParticularAct(act);
  const compilerIdentity =
    options.compilerIdentity ?? BOOK_OF_ACTS_COMPILER_IDENTITY;

  const actDigest = await sha256Content(normalized);
  const compilerIdentityDigest = await sha256Content(compilerIdentity);

  const sourceRefs = Array.from(
    new Set([
      ...normalized.occurrences.flatMap((value) => value.sourceRefs),
      ...normalized.constraints.flatMap((value) => value.sourceRefs),
    ]),
  ).sort();

  const body = {
    schema: "nuthang.act-receipt/0.1" as const,
    actDigest,
    profile: BOOK_OF_ACTS_PROFILE,
    compilerIdentity,
    compilerIdentityDigest,
    participantRefs: normalized.participants.map((value) => value.actorRef),
    witnessRefs: [...normalized.witnessRefs],
    sourceRefs,
    disposition: normalized.disposition,
    temporalBinding: structuredClone(normalized.temporalBinding),
    previousReceiptRefs: [...(options.previousReceiptRefs ?? [])].sort(),
    claims: {
      admittedParticularDigest: true as const,
      deterministicIdentity: true as const,
    },
    doesNotClaim: [...BOOK_OF_ACTS_NON_CLAIMS],
  };

  return {
    ...body,
    receiptId: await sha256Content(body),
  };
}
```

- [ ] **Step 4: Run tests and lint**

Run:

```bash
npm run test:book-of-acts
npm run lint
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/profiles/bookOfActs/compileAct.ts src/profiles/bookOfActs/bookOfActs.test.ts
git commit -m "feat: compile deterministic Book of Acts receipts"
```

---

### Task 3: Close a bounded nuBlock without inferring success

**Files:**
- Modify: `src/profiles/bookOfActs/types.ts`
- Create: `src/profiles/bookOfActs/nuBlock.ts`
- Modify: `src/profiles/bookOfActs/bookOfActs.test.ts`

**Interfaces:**
- Consumes: one or more `ActReceiptV0` objects and an explicitly declared block disposition.
- Produces:
  - `NuBlockV0`
  - `closeNuBlock(input): Promise<NuBlockV0>`

- [ ] **Step 1: Add the NuBlock type and failing tests**

Add to `types.ts`:

```ts
export type NuBlockV0 = {
  schema: "nuthang.nu-block/0.1";
  blockId: string;
  profile: "nuthang/book-of-acts/v0";
  subjectRef: string;
  actReceiptRefs: string[];
  artifactRefs: string[];
  disposition: ActDispositionV0;
  residualFog: string[];
};
```

Then add tests:

```ts
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

  const completed = await closeNuBlock({
    ...common,
    disposition: "scoped_complete",
  });
  const partial = await closeNuBlock({
    ...common,
    disposition: "partial",
  });

  assert.notEqual(completed.blockId, partial.blockId);
});

await test("nuBlock refuses empty receipt history", async () => {
  await assert.rejects(
    () =>
      closeNuBlock({
        subjectRef: baseAct.subject.ref,
        receipts: [],
        artifactRefs: [],
        disposition: "unresolved",
        residualFog: [],
      }),
    /at least one ActReceipt/,
  );
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm run test:book-of-acts
```

Expected: FAIL because `nuBlock.ts` does not exist.

- [ ] **Step 3: Implement explicit block closure**

Create `nuBlock.ts`:

```ts
import { sha256Content } from "./canonicalize";
import { BOOK_OF_ACTS_PROFILE } from "./compileAct";
import type {
  ActDispositionV0,
  ActReceiptV0,
  NuBlockV0,
} from "./types";

export async function closeNuBlock(input: {
  subjectRef: string;
  receipts: ActReceiptV0[];
  artifactRefs: string[];
  disposition: ActDispositionV0;
  residualFog: string[];
}): Promise<NuBlockV0> {
  if (!input.subjectRef.trim()) throw new Error("subjectRef must be non-empty");
  if (input.receipts.length === 0) {
    throw new Error("nuBlock requires at least one ActReceipt");
  }

  const body = {
    schema: "nuthang.nu-block/0.1" as const,
    profile: BOOK_OF_ACTS_PROFILE,
    subjectRef: input.subjectRef,
    actReceiptRefs: input.receipts.map((receipt) => receipt.receiptId).sort(),
    artifactRefs: [...input.artifactRefs].sort(),
    disposition: input.disposition,
    residualFog: [...input.residualFog],
  };

  return {
    ...body,
    blockId: await sha256Content(body),
  };
}
```

Do not infer `disposition` from receipt count, witness count, or outcome vocabulary. The caller must supply it.

- [ ] **Step 4: Run tests and lint**

Run:

```bash
npm run test:book-of-acts
npm run lint
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/profiles/bookOfActs/types.ts src/profiles/bookOfActs/nuBlock.ts src/profiles/bookOfActs/bookOfActs.test.ts
git commit -m "feat: add bounded nuBlock closure"
```

---

### Task 4: Add independent read-only receipt verification and tamper refusal

**Files:**
- Create: `src/profiles/bookOfActs/verifyReceipt.ts`
- Modify: `src/profiles/bookOfActs/bookOfActs.test.ts`

**Interfaces:**
- Consumes: `ActReceiptV0`, source `ParticularActV0`, optional expected `CompilerIdentity`.
- Produces:
  - `ActReceiptVerificationV0`
  - `verifyActReceipt(receipt, act, options?): Promise<ActReceiptVerificationV0>`

- [ ] **Step 1: Add failing verifier tests**

```ts
import { verifyActReceipt } from "./verifyReceipt";

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
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm run test:book-of-acts
```

Expected: FAIL because `verifyReceipt.ts` does not exist.

- [ ] **Step 3: Implement the verifier by recomputation, not trust**

Create `verifyReceipt.ts`:

```ts
import type { CompilerIdentity } from "../../lib/jubilee";
import { sha256Content } from "./canonicalize";
import {
  BOOK_OF_ACTS_COMPILER_IDENTITY,
  BOOK_OF_ACTS_NON_CLAIMS,
  BOOK_OF_ACTS_PROFILE,
  compileAct,
} from "./compileAct";
import type { ActReceiptV0, ParticularActV0 } from "./types";

export type ActReceiptVerificationV0 = {
  status: "VALID" | "MISMATCH" | "MALFORMED";
  checks: {
    profileMatches: boolean;
    actDigestMatches: boolean;
    receiptIdMatches: boolean;
    compilerIdentityMatches: boolean;
    nonClaimsIntact: boolean;
  };
  conclusion: string;
};

export async function verifyActReceipt(
  receipt: ActReceiptV0,
  act: ParticularActV0,
  options: { compilerIdentity?: CompilerIdentity } = {},
): Promise<ActReceiptVerificationV0> {
  const compilerIdentity =
    options.compilerIdentity ?? BOOK_OF_ACTS_COMPILER_IDENTITY;

  if (receipt.schema !== "nuthang.act-receipt/0.1") {
    return {
      status: "MALFORMED",
      checks: {
        profileMatches: false,
        actDigestMatches: false,
        receiptIdMatches: false,
        compilerIdentityMatches: false,
        nonClaimsIntact: false,
      },
      conclusion: "Receipt schema is not Book of Acts v0.",
    };
  }

  const expected = await compileAct(act, {
    compilerIdentity,
    previousReceiptRefs: receipt.previousReceiptRefs,
  });

  const checks = {
    profileMatches: receipt.profile === BOOK_OF_ACTS_PROFILE,
    actDigestMatches: receipt.actDigest === expected.actDigest,
    receiptIdMatches: receipt.receiptId === expected.receiptId,
    compilerIdentityMatches:
      receipt.compilerIdentityDigest ===
      (await sha256Content(compilerIdentity)),
    nonClaimsIntact:
      JSON.stringify(receipt.doesNotClaim) ===
      JSON.stringify([...BOOK_OF_ACTS_NON_CLAIMS]),
  };

  const valid = Object.values(checks).every(Boolean);

  return {
    status: valid ? "VALID" : "MISMATCH",
    checks,
    conclusion: valid
      ? "The supplied particular deterministically reproduces this Book of Acts receipt under the supplied compiler identity."
      : "The supplied particular or receipt does not reproduce the claimed Book of Acts identity.",
  };
}
```

The conclusion must remain bounded. Do not say the human act is true, legal, good, valuable, authorized, or consented for AI use.

- [ ] **Step 4: Run tests and lint**

Run:

```bash
npm run test:book-of-acts
npm run lint
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/profiles/bookOfActs/verifyReceipt.ts src/profiles/bookOfActs/bookOfActs.test.ts
git commit -m "feat: verify Book of Acts receipts independently"
```

---

### Task 5: Freeze the grocery-delivery specimen and hostile particular/temporal controls

**Files:**
- Create: `src/profiles/bookOfActs/fixtures.ts`
- Modify: `src/profiles/bookOfActs/bookOfActs.test.ts`

**Interfaces:**
- Produces:
  - `GROCERY_DELIVERY_ACT_V0`
  - `retrospectiveGroceryAct()`
  - fixture mutation helpers used only by tests

- [ ] **Step 1: Move the canonical grocery specimen into fixtures and add failing hostile assertions**

Create fixture API imports in the test, then add:

```ts
import {
  GROCERY_DELIVERY_ACT_V0,
  retrospectiveGroceryAct,
} from "./fixtures";

await test("grocery specimen has no economic or training grant", () => {
  assert.equal(GROCERY_DELIVERY_ACT_V0.disclosure.aiTraining, "not-granted");
  assert.equal("economicProjection" in GROCERY_DELIVERY_ACT_V0, false);
});

await test("same summary but different particulars has different identity", async () => {
  const left = structuredClone(GROCERY_DELIVERY_ACT_V0);
  const right = structuredClone(GROCERY_DELIVERY_ACT_V0);
  right.constraints[0].kind = "refrigeration-gap";

  assert.notEqual(
    (await compileAct(left)).receiptId,
    (await compileAct(right)).receiptId,
  );
});

await test("removing residual fog changes receipt identity", async () => {
  const clear = structuredClone(GROCERY_DELIVERY_ACT_V0);
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
  const manyWitnesses = structuredClone(GROCERY_DELIVERY_ACT_V0);
  manyWitnesses.witnessRefs = Array.from(
    { length: 100 },
    (_, index) => `witness:${index}`,
  );

  const receipt = await compileAct(manyWitnesses);
  assert.equal("authority" in receipt, false);
  assert.ok(receipt.doesNotClaim.includes("receipt != authority"));
});

await test("partial completion remains history", async () => {
  const partial = structuredClone(GROCERY_DELIVERY_ACT_V0);
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
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm run test:book-of-acts
```

Expected: FAIL because `fixtures.ts` does not exist and the test still owns the local fixture.

- [ ] **Step 3: Create the frozen fixture**

Create `fixtures.ts` with the exact grocery specimen from Task 1, export it through `Object.freeze` at the top level, and provide a retrospective clone:

```ts
import type { ParticularActV0 } from "./types";

export const GROCERY_DELIVERY_ACT_V0: ParticularActV0 = Object.freeze({
  schema: "nuthang.particular-act/0.1",
  actId: "act:grocery-delivery-001",
  subject: { kind: "community-need", ref: "need:grocery-delivery-001" },
  needRefs: ["need:grocery-delivery-001"],
  offerRefs: ["offer:food", "offer:vehicle", "offer:time"],
  joinRefs: ["join:a", "join:b", "join:c"],
  participants: [
    { actorRef: "human:a", declaredCapacity: "driver", contributionRefs: ["offer:vehicle"] },
    { actorRef: "human:b", declaredCapacity: "food", contributionRefs: ["offer:food"] },
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
  witnessRefs: ["witness:driver", "witness:recipient"],
  disposition: "scoped_complete",
  residualFog: ["requested item unavailable; scope allowed explicit exception"],
  disclosure: {
    communityMemory: "named-circle",
    aiTraining: "not-granted",
  },
  temporalBinding: {
    subjectOccurrenceRef: "time:2026-09-18T12:00:00Z",
    declarationOccurrenceRef: "time:2026-09-18T11:30:00Z",
    applicationOccurrenceRef: "time:2026-09-18T13:00:00Z",
    relation: "contemporaneous-attested",
  },
});

export function retrospectiveGroceryAct(): ParticularActV0 {
  const act = structuredClone(GROCERY_DELIVERY_ACT_V0);
  act.temporalBinding = {
    subjectOccurrenceRef: "time:2026-03-18T12:00:00Z",
    declarationOccurrenceRef: "time:2026-09-18T11:30:00Z",
    applicationOccurrenceRef: "time:2026-09-18T13:00:00Z",
    relation: "retrospective",
  };
  return act;
}
```

Then replace the local `baseAct` in the test with `structuredClone(GROCERY_DELIVERY_ACT_V0)`.

- [ ] **Step 4: Run the complete profile proof**

Run:

```bash
npm run test:book-of-acts
npm run lint
npm run build
```

Expected:
- Book of Acts test command exits 0 with every named assertion printing `PASS`.
- TypeScript lint exits 0.
- Existing Vite production build exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/profiles/bookOfActs/fixtures.ts src/profiles/bookOfActs/bookOfActs.test.ts
git commit -m "test: freeze Book of Acts grocery specimen"
```

---

### Task 6: Add a reproducibility receipt and document the executable boundary

**Files:**
- Create: `evidence/book-of-acts-v0-scope.json`
- Create: `docs/book-of-acts-v0.md`
- Modify: `README.md`

**Interfaces:**
- Documentation only. No runtime API expansion.
- Records exactly what the first executable slice proves and refuses to claim.

- [ ] **Step 1: Add a failing documentation/evidence assertion**

Before creating the files, add a final test using Node file reads:

```ts
import { readFile } from "node:fs/promises";

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
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
npm run test:book-of-acts
```

Expected: FAIL with `ENOENT` for `evidence/book-of-acts-v0-scope.json`.

- [ ] **Step 3: Add the machine-readable evidence scope**

Create `evidence/book-of-acts-v0-scope.json`:

```json
{
  "profile": "nuthang/book-of-acts/v0",
  "verification_mode": "local_deterministic_reproducibility",
  "claims": [
    "the supplied particular canonicalizes deterministically",
    "the supplied particular reproduces the named act digest",
    "the supplied compiler identity and particular reproduce the named receipt identity",
    "explicit nuBlock disposition remains part of block identity"
  ],
  "does_not_claim": [
    "human worth",
    "legal validity",
    "economic value",
    "token entitlement",
    "authority",
    "consensus on meaning",
    "AI training consent",
    "future availability",
    "global identity"
  ]
}
```

- [ ] **Step 4: Document the runnable boundary**

Create `docs/book-of-acts-v0.md` containing:

```markdown
# Book of Acts v0

Book of Acts v0 is the first executable nuThang profile inside Jubilee Engine VM.

Run:

```bash
npm run test:book-of-acts
npm run lint
npm run build
```

The profile proves deterministic preservation and verification of one bounded attributable act.

It does not issue tokens, money, reputation, authority, or AI-training permission.

## Current flow

```text
ParticularActV0
  -> canonicalize
  -> SHA-256 act digest
  -> ActReceiptV0
  -> independent verification
  -> explicit nuBlock closure
```

## First specimen

The frozen specimen is one grocery-delivery occurrence with an unavailable requested item preserved as a constraint and residual fog.

Its economic projection is absent.

Its AI-training permission is not granted.

## Governing law

THE PARTICULAR SURVIVES EVERY PROJECTION.
```

Add a short README section linking:
- the design spec;
- `docs/book-of-acts-v0.md`;
- `evidence/book-of-acts-v0-scope.json`.

Do not rewrite the existing Jubilee VM README or rebrand the entire VM as nuThang.

- [ ] **Step 5: Run final verification**

Run fresh:

```bash
npm run test:book-of-acts
npm run lint
npm run build
```

Expected: all exit 0.

Also inspect the diff and confirm:
- no `src/lib/jubilee.ts` changes;
- no `src/lib/verifyReceipts.ts` changes;
- no token/economic/AI-training runtime implementation;
- no human score fields;
- no wall-clock timestamps generated by compiler code.

- [ ] **Step 6: Commit**

```bash
git add evidence/book-of-acts-v0-scope.json docs/book-of-acts-v0.md README.md src/profiles/bookOfActs/bookOfActs.test.ts
git commit -m "docs: witness Book of Acts v0 proof boundary"
```

---

## Final verification checklist

Before claiming the implementation complete:

- [ ] `npm run test:book-of-acts` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0.
- [ ] Same particular under reordered set-like fields reproduces the same receipt ID.
- [ ] Changed constraint changes receipt identity.
- [ ] Changed residual fog changes receipt identity.
- [ ] Changed disposition changes block identity.
- [ ] Retrospective binding is distinguishable from contemporaneous binding.
- [ ] Reported evidence remains reported.
- [ ] No AI training permission is inferred.
- [ ] No economic projection exists in the first specimen.
- [ ] No receipt contains a human-worth or authority field.
- [ ] Verification does not mutate act or receipt.
- [ ] Book of Acts uses real `sha256:<64 hex>` addresses.
- [ ] Legacy Jubilee hashing/receipt behavior remains untouched.
- [ ] Diff contains no wallet, token transfer, market, mining, staking, social score, or global identity implementation.

## Deferred after v0

These require separate designs and approvals after the receipt substrate is proven:

1. **CapacityEvidence projection** — historically demonstrated capability without present-obligation or human-status semantics.
2. **Economic garment specimen** — one synthetic non-transferable project-credit policy over an unchanged ActReceipt.
3. **AI-use grant specimen** — local retrieval allowed while model training remains refused.
4. **Jubilee Campfire adapter** — map Seed/Offer/Pledge/Receipt objects into Book of Acts particulars without making Campfire depend on VM internals.
5. **Human Witness adapter** — consume encounter evidence without turning witnessed acts into authority.
6. **BODY adapter** — expose declared versus historically observed capacity without centrality becoming canon.
