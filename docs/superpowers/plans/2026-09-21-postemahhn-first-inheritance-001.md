# FIRST-INHERITANCE-001 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest complete PostEmahh'n runtime that can execute NOW → MAIL → HEIR, produce a G1 descendant, render it as a physical-card artifact, and verify its ancestry back to the Genesis roots.

**Architecture:** Create a new standalone `the-static-collective/postemahhn` TypeScript repository. Keep a pure deterministic kernel at the center; layer Genesis fixtures, Coderoom orchestration, correspondence/inheritance state, a deterministic printable-card renderer, and narrow Jubilee/Workbench adapter contracts around it. No adapter may absorb another project's authority, and no UI is allowed to become the source of receipt truth.

**Tech Stack:** TypeScript on Node.js; ESM modules; Node `crypto` for SHA-256; Vitest for tests; Zod only if runtime schema validation materially reduces hand-written validation; `qrcode` for deterministic QR SVG generation; plain HTML/SVG output for card bodies; package lock committed.

**Spec:** `docs/superpowers/specs/2026-09-21-postemahhn-v0.1-design.md` in `the-static-collective/Jubilee-Engine-VM` PR #12.

## Global Constraints

- Receipt before mythology.
- The particular survives every projection.
- Identity and capability are separate.
- Composition preserves participants.
- Complexity belongs in composition, not enumeration.
- Print is a historical snapshot.
- Evolution requires a receipt.
- Automation yields to declared human agency.
- Possession does not automatically imply authorship, authority, copyright, truth, or ownership of descendants.
- Execution leaves a trace.
- Selection is not evidence.
- Declared is not resolved. Attempted is not completed.
- Same bytes do not imply the same occurrence.
- Reconstitution creates a new local particular.
- No retrocausality.
- Old lineage grants depth, not aristocracy.
- Root stewardship is not a tollbooth.
- Model-session delegation is bounded and expires according to explicit scope.
- No arbitrary code or shell execution from card payloads.
- Unsupported external capabilities fail closed.
- All rules-visible randomness must carry replay material.
- PostEmahh'n verification may not silently broaden Jubilee verification claims.
- The first crater implements only the 15-card microdeck plus FIRST-INHERITANCE-001; it does not implement the full 72-card field.

## Review Focus

1. **Canonical hashing under object-key reordering** — semantically identical canonical structures must hash identically; arrays remain order-sensitive where the protocol says order matters. Task 1 pins this.
2. **Spoofed lineage/generation** — a caller must not be able to claim G7 when supplied parents imply G2, omit a direct parent, or counterfeit Genesis status. Tasks 2 and 6 pin this.
3. **Late MAIL return against advanced present state** — returning a Thread forked from old state must create a new Arrival and must not mutate closed history. Task 5 pins this.
4. **Expired/over-broad model delegation** — a model session with missing, expired, or unrelated capabilities must fail closed without modifying state. Task 7 pins this.
5. **Physical-card overclaim** — scanning/rendering a card must not imply current physical possession, authorship, market value, or uniqueness beyond declared run facts. Task 8 pins this.

---

## Repository file map

The implementation should create this topology before feature work expands it:

```text
postemahhn/
  README.md
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    kernel/
      canonical.ts
      ids.ts
      types.ts
      lineage.ts
      composition.ts
      orders.ts
      encounter.ts
      receipts.ts
    genesis/
      roots.ts
      microdeck.ts
    temporal/
      pulse.ts
      thread.ts
      archive.ts
    runtime/
      capabilities.ts
      coderoom.ts
    print/
      card-body.ts
      qr.ts
    verify/
      verifier.ts
    adapters/
      jubilee.ts
      workbench.ts
    cli/
      first-inheritance.ts
  fixtures/
    first-inheritance/
      expected.json
  tests/
    kernel/
      canonical.test.ts
      lineage.test.ts
      composition.test.ts
      encounter.test.ts
    temporal/
      thread.test.ts
      archive.test.ts
    runtime/
      coderoom.test.ts
    print/
      card-body.test.ts
    verify/
      verifier.test.ts
    integration/
      first-inheritance.test.ts
  docs/
    protocol/
      receipt-scope.md
      first-inheritance-001.md
```

Every source file owns one responsibility. No file should own both serialization/hashing and gameplay semantics.

---

### Task 1: Repository bootstrap and canonical receipt hashing

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/kernel/canonical.ts`
- Create: `src/kernel/ids.ts`
- Test: `tests/kernel/canonical.test.ts`

**Interfaces:**
- Consumes: Node.js `crypto`.
- Produces:
  - `canonicalize(value: JsonValue): string`
  - `sha256Canonical(value: JsonValue): string`
  - `receiptId(namespace: string, value: JsonValue): string`
  - `type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }`

- [ ] **Step 1: Bootstrap the repository and test command**

Create `package.json` with ESM TypeScript scripts:

```json
{
  "name": "@static-collective/postemahhn",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.json",
    "demo:first-inheritance": "tsx src/cli/first-inheritance.ts"
  },
  "devDependencies": {
    "tsx": "^4",
    "typescript": "^5",
    "vitest": "^3"
  }
}
```

Use strict TypeScript and commit the generated package lock.

- [ ] **Step 2: Write the failing canonicalization tests**

```ts
import { describe, expect, it } from "vitest";
import { canonicalize, sha256Canonical } from "../../src/kernel/canonical.js";

describe("canonicalize", () => {
  it("sorts object keys recursively", () => {
    expect(canonicalize({ b: 2, a: { d: 4, c: 3 } }))
      .toBe('{"a":{"c":3,"d":4},"b":2}');
  });

  it("keeps array order significant", () => {
    expect(sha256Canonical(["A", "B"]))
      .not.toBe(sha256Canonical(["B", "A"]));
  });

  it("hashes key-reordered objects identically", () => {
    expect(sha256Canonical({ a: 1, b: 2 }))
      .toBe(sha256Canonical({ b: 2, a: 1 }));
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalize({ n: Number.NaN as never })).toThrow();
  });
});
```

- [ ] **Step 3: Run the test and verify failure**

Run:

```bash
npm test -- tests/kernel/canonical.test.ts
```

Expected: FAIL because `canonicalize` and `sha256Canonical` do not exist.

- [ ] **Step 4: Implement canonicalization and namespaced IDs**

Implement recursive stable object-key ordering, preserve arrays, reject `undefined`, functions, symbols, BigInt, NaN, and infinities, then hash UTF-8 canonical text with SHA-256.

```ts
export function receiptId(namespace: string, value: JsonValue): string {
  return `${namespace}:sha256:${sha256Canonical(value)}`;
}
```

- [ ] **Step 5: Run tests, typecheck, and commit**

Run:

```bash
npm test -- tests/kernel/canonical.test.ts
npm run typecheck
```

Expected: PASS.

Commit:

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts src/kernel/canonical.ts src/kernel/ids.ts tests/kernel/canonical.test.ts
git commit -m "feat: add deterministic canonical receipt hashing"
```

---

### Task 2: Card, Genesis, and lineage invariants

**Files:**
- Create: `src/kernel/types.ts`
- Create: `src/kernel/lineage.ts`
- Create: `src/genesis/roots.ts`
- Create: `src/genesis/microdeck.ts`
- Test: `tests/kernel/lineage.test.ts`

**Interfaces:**
- Consumes: `receiptId()`.
- Produces:
  - `CardKind`, `Affinity`, `TemporalScope`, `CardSpec`, `LineageRef`
  - `GENESIS_ROOTS: readonly CardSpec[]`
  - `MICRODECK: readonly CardSpec[]`
  - `deriveGeneration(parents: readonly LineageRef[]): number`
  - `createDescendantLineage(input: CreateDescendantLineageInput): LineageRef`
  - `validateLineage(lineage: LineageRef, parents: readonly LineageRef[]): void`

Define exact card kinds and affinities from the spec.

- [ ] **Step 1: Write failing Genesis and lineage tests**

Tests must prove:

```ts
expect(GENESIS_ROOTS.map(x => x.title)).toEqual([
  "RECEIVE // G0",
  "HOLD // G0",
  "POUR // G0",
]);

expect(GENESIS_ROOTS.every(x => x.lineage.generation === 0)).toBe(true);
expect(new Set(MICRODECK.map(x => x.cardId)).size).toBe(15);
```

Also test:

```ts
expect(deriveGeneration([{ generation: 2 }, { generation: 5 }] as LineageRef[]))
  .toBe(6);
```

and reject:
- a descendant claiming generation 7 from G0 parents;
- a descendant omitting a supplied direct parent;
- any attempt to set `genesis: true` through descendant creation.

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
npm test -- tests/kernel/lineage.test.ts
```

Expected: FAIL because types and lineage helpers do not exist.

- [ ] **Step 3: Implement types and the three immutable Genesis roots**

Each root must declare:
- generation 0;
- no parent receipts;
- its own root receipt;
- `distribution: "SINGULAR"`;
- `iterationPolicy: "OPEN"`;
- inherited non-claims.

Do not encode a financial value or price field.

- [ ] **Step 4: Implement the remaining 12 microdeck cards**

Create exact fixtures:
- Correspondence Door
- Return Door
- Archive Gate
- Unopened Letter
- Sleeved Receipt
- Gift Parcel
- Composition Table
- Reconstitute
- Perform
- Selection Is Not Evidence
- Composition Preserves Parts
- Execution Leaves Receipt

Each must have Kind, one/two Affinities, temporal scopes, ports/capability refs sufficient for later tasks, and stable `cardId`.

- [ ] **Step 5: Implement lineage derivation and validation**

`createDescendantLineage` must compute generation internally. Do not accept caller-supplied generation.

For multiple parents:
`1 + Math.max(...parents.map(p => p.generation))`.

The function must preserve:
- every direct parent receipt;
- every distinct root receipt;
- human-readable branch path only as descriptive metadata.

- [ ] **Step 6: Run tests, typecheck, and commit**

```bash
npm test -- tests/kernel/lineage.test.ts
npm run typecheck
git add src/kernel/types.ts src/kernel/lineage.ts src/genesis tests/kernel/lineage.test.ts
git commit -m "feat: define Genesis microdeck and lineage laws"
```

---

### Task 3: Typed composition, ports, and selection non-evidence

**Files:**
- Create: `src/kernel/composition.ts`
- Create: `src/kernel/orders.ts`
- Test: `tests/kernel/composition.test.ts`

**Interfaces:**
- Consumes: `CardSpec`.
- Produces:
  - `CompositionManifest`
  - `TypedRelation`
  - `PortAttachment`
  - `compose(input: ComposeInput): CompositionManifest`
  - `selectTarget(input: SelectionInput): SelectionResult`
  - `OrderRule`
  - `evaluateOrders(rules: readonly OrderRule[], state: EncounterState): OrderDecision | null`

- [ ] **Step 1: Write failing composition tests**

Pin these behaviors:
- composing two members preserves both member IDs;
- linked-port attachment fails when port types are incompatible;
- creating a composition never marks either member as verified merely because it was selected;
- `selectTarget()` returns selection metadata with `evidenceAdded: false`;
- highest-priority legal Order wins;
- explicit human action can override an automatic Order.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/kernel/composition.test.ts
```

- [ ] **Step 3: Implement composition and typed port validation**

A composition ID is derived from canonical content:
members, relations, attachments, parent receipts, room ID, rules version.

Do not include mutable UI labels in the hash.

- [ ] **Step 4: Implement minimal Order grammar**

Represent an Order as orthogonal primitives:

```ts
interface OrderRule {
  orderId: string;
  priority: number;
  selector: Selector;
  predicate: Predicate;
  action: ActionRef;
  modifier?: ModifierRef;
  automatic: boolean;
}
```

No bespoke `selector × predicate × action × modifier` classes.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/kernel/composition.test.ts
npm run typecheck
git add src/kernel/composition.ts src/kernel/orders.ts tests/kernel/composition.test.ts
git commit -m "feat: add compositional card grammar"
```

---

### Task 4: NOW / PULSE encounter and receipt resolution

**Files:**
- Create: `src/kernel/encounter.ts`
- Create: `src/kernel/receipts.ts`
- Create: `src/temporal/pulse.ts`
- Test: `tests/kernel/encounter.test.ts`

**Interfaces:**
- Consumes: `CompositionManifest`, `OrderRule`.
- Produces:
  - `EncounterState`
  - `DeclaredIntent`
  - `Disposition = "attempted" | "blocked" | "interrupted" | "partial" | "resolved" | "scope_uncertain"`
  - `PlayReceipt`
  - `declareIntent()`
  - `resolveIntent()`
  - `closePulse()`

- [ ] **Step 1: Write failing encounter tests**

Cover:
- declaration alone creates no resolved consequence;
- blocked and partial dispositions remain distinct from resolved;
- explicit human action overrides eligible automatic action;
- a completed Pulse emits a receipt with starting-state hash, ending-state hash, ruleset hash, event trace, and parent receipts;
- identical deterministic inputs produce identical receipt IDs;
- changing `rulesetHash` changes the PlayReceipt ID.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/kernel/encounter.test.ts
```

- [ ] **Step 3: Implement immutable event reduction**

Do not mutate prior `EncounterState` objects. Each event returns a new state.

Use explicit `DeclaredIntent` → reaction list → disposition → consequence events.

- [ ] **Step 4: Implement deterministic Pulse closure**

If rules-visible randomness is absent in FIRST-INHERITANCE-001, omit the seed rather than inventing one. The interface must support a future seed.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/kernel/encounter.test.ts
npm run typecheck
git add src/kernel/encounter.ts src/kernel/receipts.ts src/temporal/pulse.ts tests/kernel/encounter.test.ts
git commit -m "feat: add deterministic pulse encounter receipts"
```

---

### Task 5: MAIL / THREAD correspondence without retrocausality

**Files:**
- Create: `src/temporal/thread.ts`
- Test: `tests/temporal/thread.test.ts`

**Interfaces:**
- Consumes: immutable `EncounterState` hashes and receipts.
- Produces:
  - `ThreadPacket`
  - `ThreadEvent`
  - `Arrival`
  - `openThread()`
  - `continueThread()`
  - `returnThread()`
  - `closeThread()`
  - `receiveThreadArrival(currentState, closedThread): { state: EncounterState; arrival: Arrival }`

- [ ] **Step 1: Write failing correspondence tests**

Construct:
- `S17` as immutable fork state;
- live continuation `S18 → S19 → S20`;
- Thread reply derived from `S17`.

Assert:
- `S17` hash remains unchanged;
- `S20` history remains unchanged;
- returning the Thread creates a new Arrival event attached to current state;
- incompatible returned state remains a branch instead of overwriting current state;
- closing a Thread emits a `ThreadReceipt`;
- thread response with wrong `rulesVersion` fails closed unless an explicit migration rule exists; v0.1 has no migration rule.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/temporal/thread.test.ts
```

- [ ] **Step 3: Implement append-only Thread event history**

Never expose a setter that changes `forkStateHash`.

Allowed response verbs in v0.1:
`CONTINUE`, `RETURN`, `CLOSE`.

- [ ] **Step 4: Implement present-time Arrival reconciliation**

A returned Thread is materialized as:
- source ThreadReceipt;
- fork-state reference;
- arrival timestamp supplied by caller/runtime clock boundary;
- reconciliation status.

No past event arrays are rewritten.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/temporal/thread.test.ts
npm run typecheck
git add src/temporal/thread.ts tests/temporal/thread.test.ts
git commit -m "feat: add non-retrocausal correspondence threads"
```

---

### Task 6: HEIR / archive and G1 reconstitution

**Files:**
- Create: `src/temporal/archive.ts`
- Test: `tests/temporal/archive.test.ts`

**Interfaces:**
- Consumes: closed `PlayReceipt` and `ThreadReceipt`.
- Produces:
  - `AncestorRef`
  - `ArchiveState`
  - `archiveReceipt()`
  - `reconstitute(input: ReconstituteInput): ReconstitutedCard`

- [ ] **Step 1: Write failing archive/reconstitution tests**

Assert:
- open Threads cannot be archived as completed Ancestors;
- closed eligible receipts can;
- Archive operations never mutate receipt content;
- G1 generation is computed from parents rather than accepted from caller;
- G1 gets a new receipt identity;
- all direct parents and all root receipts survive;
- caller cannot set `genesis: true`;
- two reconstitutions with distinct local occurrence IDs are distinct particulars even if content payload matches.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/temporal/archive.test.ts
```

- [ ] **Step 3: Implement Archive eligibility**

For v0.1, eligible:
- resolved/partial closed Pulse receipts;
- closed Thread receipts.

Ineligible:
- open Thread;
- merely declared intent;
- unresolved object without a closed receipt.

- [ ] **Step 4: Implement reconstitution**

`reconstitute()` requires an explicit local occurrence ID, parents, and source CardSpec/composition data.

It computes:
- new receipt ID;
- generation;
- roots;
- direct parents;
- inherited non-claims.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/temporal/archive.test.ts
npm run typecheck
git add src/temporal/archive.ts tests/temporal/archive.test.ts
git commit -m "feat: add ancestor archive and descendant reconstitution"
```

---

### Task 7: Coderoom and bounded human/model capability delegation

**Files:**
- Create: `src/runtime/capabilities.ts`
- Create: `src/runtime/coderoom.ts`
- Test: `tests/runtime/coderoom.test.ts`

**Interfaces:**
- Consumes: CardRefs, Capabilities, Encounter/Thread/Archive operations.
- Produces:
  - `ParticipantRef`
  - `HumanParticipant`
  - `ModelSessionRef`
  - `CapabilityGrant`
  - `CoderoomState`
  - `presentPhysicalCard()`
  - `delegateToModelSession()`
  - `authorizeAction()`
  - `expireSession()`

- [ ] **Step 1: Write failing Coderoom tests**

Tests must prove:
- human can present a physical embodiment reference;
- presentation records a claimed presentation event but does not automatically prove legal ownership/authorship;
- model session cannot be the physical presenter;
- presenting a card can create a bounded session grant such as `TRACE`, `SEEK`, `COMPOSE`;
- expired grants fail closed;
- grant for `TRACE` cannot authorize `RECONSTITUTE`;
- denied action emits no state mutation;
- ending the session invalidates session-scoped grants.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/runtime/coderoom.test.ts
```

- [ ] **Step 3: Implement capability grants as data**

```ts
interface CapabilityGrant {
  grantId: string;
  subjectSessionId: string;
  capabilities: readonly string[];
  sourceCardId: string;
  roomId: string;
  issuedAt: string;
  expiresAt?: string;
  expiresWithSession: boolean;
}
```

No grant may contain an executable callback or shell command.

- [ ] **Step 4: Implement Coderoom authorization**

Authorization checks:
1. correct room;
2. correct session;
3. not expired;
4. requested capability present;
5. source card/grant still valid under room rules.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/runtime/coderoom.test.ts
npm run typecheck
git add src/runtime tests/runtime/coderoom.test.ts
git commit -m "feat: add bounded coderoom capability delegation"
```

---

### Task 8: Deterministic physical card body and verification QR

**Files:**
- Create: `src/print/qr.ts`
- Create: `src/print/card-body.ts`
- Test: `tests/print/card-body.test.ts`

**Interfaces:**
- Consumes: descendant `CardSpec`, `EmbodimentReceipt`, verification URI.
- Produces:
  - `renderCardFrontSvg(input): string`
  - `renderCardBackSvg(input): string`
  - `renderQrSvg(uri: string): Promise<string>`
  - `createEmbodimentReceipt(input): EmbodimentReceipt`

- [ ] **Step 1: Add the QR dependency and write failing renderer tests**

Add `qrcode` and its type package if needed.

Tests must assert:
- front includes title, Kind, Affinity, Form/generation, and LMV maker-mark hook;
- back includes root lineage, direct parents, run/copy facts, snapshot hash, verification URI, and QR markup;
- renderer output is deterministic for same input;
- `copy 7 / run 25` is rendered only as a production fact;
- output does **not** contain phrases such as `owner`, `guaranteed value`, `investment`, or a claim that scanning proves possession/authorship;
- scanning payload is `postemahhn://receipt/<receipt-id>` or an explicit local resolver URI, never executable script content.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/print/card-body.test.ts
```

- [ ] **Step 3: Implement embodiment receipts**

The receipt must include:
- source receipt;
- CardSpec hash;
- layout hash;
- render-profile hash;
- run ID;
- copy ordinal;
- optional run size;
- verification URI.

Printing itself is only claimed if a separate print occurrence is actually supplied.

- [ ] **Step 4: Implement front/back SVG rendering**

Use fixed viewBox dimensions for a standard poker-card aspect ratio in v0.1; physical print size is renderer metadata, not gameplay identity.

Keep LMV as a vector hook with a simple placeholder path/line structure that can later be replaced by the finalized glyph without changing core receipt semantics if the render-profile hash changes accordingly.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/print/card-body.test.ts
npm run typecheck
git add package.json package-lock.json src/print tests/print/card-body.test.ts
git commit -m "feat: render verifiable physical card bodies"
```

---

### Task 9: Narrow Jubilee/Workbench adapter contracts and verifier

**Files:**
- Create: `src/adapters/jubilee.ts`
- Create: `src/adapters/workbench.ts`
- Create: `src/verify/verifier.ts`
- Create: `docs/protocol/receipt-scope.md`
- Test: `tests/verify/verifier.test.ts`

**Interfaces:**
- Consumes: PostEmahh'n receipts and optional external receipt envelopes.
- Produces:
  - `JubileeReceiptEnvelope`
  - `WorkbenchPresentationDescriptor`
  - `verifyPostemahhnReceipt()`
  - `VerificationReport`

- [ ] **Step 1: Write failing verification-scope tests**

Test that a successful verification report may claim only:
- canonical input hashes match;
- parent references resolve;
- rules-visible replay reproduces expected output;
- lineage constraints pass.

Test that the report explicitly does not claim:
- human authorship;
- physical custody;
- external authority;
- semantic truth;
- market value;
- permanent availability.

- [ ] **Step 2: Run tests and verify failure**

```bash
npm test -- tests/verify/verifier.test.ts
```

- [ ] **Step 3: Implement Jubilee envelope as a boundary descriptor**

Do not import Jubilee Engine source code in v0.1.

`jubilee.ts` defines an adapter shape that can carry:
- external receipt ID;
- external compiler/rules identity;
- declared verification claims;
- declared non-claims;
- source hash.

PostEmahh'n must preserve that scope.

- [ ] **Step 4: Implement Workbench presentation descriptor**

`workbench.ts` is read/present-only in v0.1. It may expose:
- title;
- card ID;
- local resolver action;
- receipt summary.

It must not claim that Workbench owns or authored the receipt.

- [ ] **Step 5: Implement verifier and scope document**

`verifyPostemahhnReceipt()` returns structured pass/fail checks plus `claims` and `doesNotClaim`.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- tests/verify/verifier.test.ts
npm run typecheck
git add src/adapters src/verify docs/protocol/receipt-scope.md tests/verify/verifier.test.ts
git commit -m "feat: add scoped verification and adapter boundaries"
```

---

### Task 10: FIRST-INHERITANCE-001 end-to-end crater

**Files:**
- Create: `src/cli/first-inheritance.ts`
- Create: `fixtures/first-inheritance/expected.json`
- Create: `tests/integration/first-inheritance.test.ts`
- Create: `docs/protocol/first-inheritance-001.md`
- Create: `README.md`

**Interfaces:**
- Consumes every prior task's public interface.
- Produces:
  - `runFirstInheritance001(): Promise<FirstInheritanceResult>`
  - CLI output directory containing:
    - `pulse-receipt.json`
    - `thread-receipt.json`
    - `g1-card.json`
    - `g1-front.svg`
    - `g1-back.svg`
    - `verification-report.json`

- [ ] **Step 1: Write the failing end-to-end test**

The test performs exactly:

```text
load Genesis roots + microdeck
→ create local Coderoom
→ register two humans + deterministic model-session stub
→ present necessary cards
→ compose Composition Table + Perform path
→ close NOW / PulseReceipt P1
→ open Correspondence Door from P1
→ advance current NOW state independently
→ return Thread through Return Door
→ verify old state remains immutable
→ close ThreadReceipt T1-R
→ Archive P1 + T1-R
→ Reconstitute descendant D1
→ assert D1.generation === 1
→ render front/back SVG
→ resolve verification URI
→ verify ancestry to Genesis roots
```

Assert the result includes all six output artifacts and the verification report passes only the bounded claims from Task 9.

- [ ] **Step 2: Run test and verify failure**

```bash
npm test -- tests/integration/first-inheritance.test.ts
```

Expected: FAIL because `runFirstInheritance001` does not exist.

- [ ] **Step 3: Implement the deterministic scenario**

Use fixed IDs and timestamps inside the fixture so replay hashes are stable.

Do not call wall-clock time, network APIs, external model APIs, filesystem discovery, or random-number generators in the deterministic core.

The model-session participant is a stub whose only behavior is to exercise a bounded grant such as `COMPOSE`; it must not be required to invent semantic content.

- [ ] **Step 4: Persist golden expected hashes**

After the first passing deterministic run, write the expected receipt IDs/hashes into `fixtures/first-inheritance/expected.json`.

Re-run and assert byte-for-byte stable rules-visible hashes.

- [ ] **Step 5: Implement CLI artifact emission**

`npm run demo:first-inheritance -- --out ./out/first-inheritance`

must write the six artifacts.

The CLI is orchestration only; it may not contain domain rules.

- [ ] **Step 6: Write the protocol walkthrough**

`docs/protocol/first-inheritance-001.md` must explain each receipt boundary and explicitly state:
- which history remains immutable;
- what the MAIL return adds;
- why D1 is G1;
- what card rendering proves;
- what verification does not prove.

- [ ] **Step 7: Run full verification**

```bash
npm test
npm run typecheck
npm run build
rm -rf out/first-inheritance
npm run demo:first-inheritance -- --out ./out/first-inheritance
test -f out/first-inheritance/pulse-receipt.json
test -f out/first-inheritance/thread-receipt.json
test -f out/first-inheritance/g1-card.json
test -f out/first-inheritance/g1-front.svg
test -f out/first-inheritance/g1-back.svg
test -f out/first-inheritance/verification-report.json
```

Expected: every command exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/cli fixtures tests/integration docs/protocol/first-inheritance-001.md README.md
git commit -m "feat: complete FIRST-INHERITANCE-001 crater"
```

---

### Task 11: Whole-branch constitutional audit

**Files:**
- Modify only files required by verified findings.
- Test: full suite.

**Interfaces:**
- Consumes: complete branch.
- Produces: no new protocol surface; only corrections.

- [ ] **Step 1: Search for forbidden scope expansion**

Run:

```bash
grep -RniE 'guaranteed value|investment|scan proves|owner by scan|semantic truth|automatic authorship' src docs README.md || true
```

Expected: no positive claim appears; explanatory/non-claim text is allowed and must be reviewed manually.

- [ ] **Step 2: Search for hidden mutation and non-determinism in kernel**

Run:

```bash
grep -RniE 'Date\.now|new Date\(|Math\.random|fetch\(|child_process|exec\(|spawn\(' src/kernel src/temporal || true
```

Expected: no matches in deterministic kernel/temporal code.

- [ ] **Step 3: Re-run all tests and build**

```bash
npm test
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 4: Run FIRST-INHERITANCE twice and compare output hashes**

Run twice into separate directories and compare canonical JSON/SVG hashes.

Expected: identical deterministic artifacts for identical fixture inputs.

- [ ] **Step 5: Verify the weird particular stayed intact**

Manually confirm all are represented by code/tests:
- physical card is not merely decorative;
- human/model asymmetry exists;
- NOW/MAIL/HEIR are independent clocks;
- unanswered/open Thread can persist;
- late response enters as a present Arrival;
- inheritance creates new capability/history without rewriting ancestors;
- Genesis descendants are open to iterate;
- G0 cannot be recreated;
- no-retrocausality holds;
- Coderoom capability is bounded;
- verification includes non-claims.

- [ ] **Step 6: Commit audit fixes if any**

If changes were necessary:

```bash
git add -A
git commit -m "fix: preserve PostEmahh'n constitutional invariants"
```

If no changes were needed, do not create an empty commit.

---

## Plan self-review result

### Spec coverage

Covered in this crater:
- receipt-first architecture;
- eight Kind / six Affinity types;
- three Genesis roots;
- 15-card microdeck;
- lineage and generation;
- typed ports/composition;
- minimal Orders;
- NOW/PULSE;
- MAIL/THREAD;
- HEIR/archive/reconstitution;
- human/model Coderoom asymmetry;
- bounded model capabilities;
- deterministic receipts;
- physical front/back artifact;
- QR resolver payload;
- Jubilee/Workbench boundaries;
- verification claim scope;
- FIRST-INHERITANCE-001.

Intentionally deferred exactly as allowed by the spec:
- full 72 cards;
- competitive balance/combat;
- NFC;
- public networking;
- persistent model identity;
- formal trust instruments;
- economic/token projections;
- full Commission/Hollow Card gameplay;
- world map/MMO layer;
- production location attestation.

### Placeholder scan

No implementation placeholders are permitted. Each task names files, public interfaces, failing tests, minimal implementation target, verification commands, and commit boundary.

### Type consistency

The plan keeps:
- `CardSpec` as immutable card identity;
- `LineageRef` as ancestry/generation data;
- `CompositionManifest` as graph composition;
- `PlayReceipt` for NOW closure;
- `ThreadPacket` / `ThreadReceipt` for MAIL;
- `AncestorRef` and `ReconstitutedCard` for HEIR;
- `CapabilityGrant` for model-session delegation;
- `EmbodimentReceipt` for physical render occurrence;
- `VerificationReport` for bounded verification.

### Execution recommendation

Use **subagent-driven implementation**. The plan has 11 independently reviewable tasks across cryptographic serialization, lineage, temporal semantics, capability safety, printing, and integration. A subtle error in one boundary can silently corrupt descendants, so fresh task-level review is worth the extra contexts.
