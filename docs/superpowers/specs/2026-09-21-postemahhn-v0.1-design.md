# PostEmahh'n v0.1 — constitutional design

**Status:** proposed design / user review gate  
**Date:** 2026-09-21  
**Host repo:** Jubilee-Engine-VM, as provenance parent only  
**Intended implementation boundary:** separate downstream PostEmahh'n runtime/protocol that composes Jubilee receipts and Static Workbench/Coderoom surfaces without absorbing their authority

> **Cards are syntax you can hold.**

## 1. Purpose

PostEmahh'n is a provenance-first physical/digital composition system in which a card can simultaneously be:

- a collectible physical object;
- a historical snapshot;
- a pointer to a verifiable receipt;
- an executable composition primitive;
- a game object;
- an inheritance seed;
- a bounded capability carrier inside a Coderoom;
- and a source from which later attributable particulars may descend.

The design must preserve the strange part: PostEmahh'n is not merely a TCG skin over a database. Physical cards, human presence, model-session participation, room-local capability, correspondence over time, lineage, and execution receipts are first-class mechanics.

The first complete vertical proof is:

```text
GENESIS RECEIPT
      ↓
PHYSICAL CARD
      ↓
HUMAN PRESENTS CARD
      ↓
CODEROOM RECOGNIZES IT
      ↓
HUMAN + MODEL COMPOSE
      ↓
PLAY / THREAD / COMMISSION
      ↓
EXECUTION
      ↓
RECEIPT
      ↓
G+1 DESCENDANT
      ↓
PRINT
      ↓
SCAN
      ↓
ANCESTRY VERIFIES
```

If this loop works once, PostEmahh'n exists.

## 2. Non-goals for v0.1

v0.1 does **not** attempt to provide:

- a cryptocurrency, fungible token, security, or investment instrument;
- speculative price claims;
- arbitrary scarcity mechanics;
- final competitive balance;
- arbitrary remote code execution;
- global identity for model instances;
- proof of authorship from a hash alone;
- proof of semantic truth from reproducibility alone;
- ownership transfer merely because a physical card changes hands;
- a universal MMORPG backend;
- NFC support;
- production public-key trust infrastructure;
- finalized trust-law instruments;
- or the entire 72-card field as required implementation scope.

v0.1 proves the organism through a 15-card microdeck and a complete NOW → MAIL → HEIR loop.

## 3. Governing laws

1. **Receipt before mythology.** Gameplay may interpret an occurrence; it may not fabricate provenance.
2. **The particular survives every projection.**
3. **Identity and capability are separate.** Kind describes what a card is; capabilities describe what it may currently do.
4. **Composition preserves participants.** A new whole never silently erases its parts.
5. **Complexity belongs in composition, not enumeration.**
6. **Print is a historical snapshot.** Later digital state never rewrites what the physical object truthfully claimed when printed.
7. **Evolution requires a receipt.**
8. **Automation yields to declared human agency.**
9. **Possession does not automatically imply authorship, authority, copyright, truth, or ownership of descendants.**
10. **Execution leaves a trace.**
11. **Selection is not evidence.**
12. **Declared is not resolved. Attempted is not completed.**
13. **Same bytes do not imply the same occurrence.**
14. **Reconstitution creates a new local particular.**
15. **No retrocausality.** A later correspondence reply may enter the present; it never rewrites already-closed history.
16. **Old lineage grants depth, not aristocracy.** Inheritance should unlock options and relations more readily than raw dominance.
17. **Root stewardship is not a tollbooth.** Genesis descendants may iterate freely while preserving root and parent references.
18. **No participant may simply declare a capability that the rules require to be witnessed, inherited, entrusted, learned, physically presented, or composed.**

## 4. Authority boundaries

### 4.1 Jubilee Engine

Jubilee supplies bounded, deterministic, provenance-preserving receipt primitives and verification.

PostEmahh'n may consume Jubilee-compatible receipts as inputs.

PostEmahh'n does not expand a Jubilee receipt's claim scope. A verified deterministic transformation still does not independently prove human authorship, objective semantic truth, legal authority, or physical possession.

### 4.2 Static Workbench / Coderoom

Workbench may surface local cards, decks, rooms, receipts, and composition state.

Workbench does not become the owner of project-native receipts merely by displaying or coordinating them.

A Coderoom is a bounded execution context, not a universal authority.

### 4.3 Physical card

The physical card is an embodiment and executable reference.

It is not itself sufficient proof of:
- current custody unless custody was separately witnessed;
- authorship;
- copyright;
- external authority;
- or uniqueness beyond its declared print-run facts.

## 5. Core data model

### 5.1 CardSpec

```ts
type CardKind =
  | "BODY"
  | "ACT"
  | "PLACE"
  | "TOOL"
  | "SOURCE"
  | "WITNESS"
  | "RULE"
  | "GATE";

type Affinity =
  | "MATTER"
  | "SIGNAL"
  | "MOTION"
  | "MEMORY"
  | "RELATION"
  | "THRESHOLD";

interface CardSpec {
  cardId: string;
  title: string;
  kind: CardKind;
  primaryAffinity: Affinity;
  secondaryAffinity?: Affinity;
  sourceReceiptId: string;
  rulesVersion: string;
  capabilities: CapabilityRef[];
  ports: PortSpec[];
  temporalScopes: TemporalScope[];
  nonClaims: string[];
}
```

A card has one primary affinity and at most one secondary affinity. With six affinities this yields 21 single-or-dual affinity signatures. Across eight kinds, the base semantic surface is 168 signatures without multiplying configuration into ontology.

### 5.2 EmbodimentReceipt

A print embodiment is a new occurrence. It references the source card/receipt; it does not pretend to be that source.

```ts
interface EmbodimentReceipt {
  embodimentId: string;
  cardId: string;
  sourceReceiptId: string;
  sourceCardSpecHash: string;
  layoutHash: string;
  renderProfileHash: string;
  printedAt: string;
  runId: string;
  copyOrdinal: number;
  runSize?: number;
  verificationUri: string;
}
```

### 5.3 Lineage

Each descendant has:
- a cryptographic identity;
- a root reference;
- direct parent references;
- scalar generation;
- and an optional human-readable branch path.

Single parent:

```text
child.generation = parent.generation + 1
```

Multiple parents:

```text
child.generation = 1 + max(parent.generation)
```

The ancestry graph remains authoritative. Generation is only a convenient scalar.

### 5.4 CompositionManifest

```ts
interface CompositionManifest {
  compositionId: string;
  members: CardRef[];
  relations: TypedRelation[];
  attachments: PortAttachment[];
  parentReceipts: string[];
  createdInRoom?: string;
  rulesVersion: string;
}
```

Composition never erases member identities.

### 5.5 DeckManifest

A deck is an executable graph, not necessarily a shuffled pile.

```ts
interface DeckManifest {
  deckId: string;
  members: CardRef[];
  compositions: CompositionRef[];
  orderSheet: OrderRule[];
  formatId: string;
  startingState: unknown;
  ancestorSlots: AncestorRef[];
  rulesVersion: string;
}
```

## 6. Ports and linked composition

Ports are typed attachment points and are orthogonal to card identity.

Possible port states:

```text
○     open port
○──○  linked ports
●     occupied port
```

Linked ports may cause one attachment to modify another without collapsing provenance.

Examples:
- BODY hosts TOOL;
- TOOL hosts ACT;
- ACT receives RULE;
- PLACE hosts BODY;
- GATE links SOURCE;
- WITNESS links SOURCE and ACT.

Port geometry must not become separate ontology classes.

## 7. Orders

The FFXII-inspired automation grammar is intentionally compositional:

```text
SELECTOR
WHEN predicate
DO action
WITH modifier
```

Orders are priority-sorted. At a decision point the runtime evaluates from highest to lowest and executes the first legal actionable Order.

Explicit human action outranks automatic Orders unless a format expressly defines a different bounded rule.

The engine implements primitive families rather than bespoke cross-product templates.

## 8. Braided Time

Every playable object may participate in three orthogonal clocks.

### 8.1 PULSE / NOW

Synchronous play:
- declare;
- react;
- resolve;
- receipt.

Duration: seconds or minutes.

### 8.2 THREAD / MAIL

Asynchronous correspondence:
- fork from an immutable verified state;
- declare intent;
- seal a ThreadPacket;
- send digitally or physically;
- continue the live world;
- receive a later response as a new present arrival;
- reconcile, branch, or close.

A later reply never edits already-closed states.

```ts
interface ThreadPacket {
  threadId: string;
  sender: ParticipantRef;
  recipient: ParticipantRef;
  forkStateHash: string;
  declaredIntent: string;
  includedCards: CardRef[];
  includedReceipts: string[];
  allowedResponseClasses: string[];
  rulesVersion: string;
  openedAt: string;
  closedAt?: string;
  eventTrace: ThreadEvent[];
}
```

### 8.3 LINEAGE / HEIR

Closed eligible receipts may become Ancestors.

Ancestors are immutable but may be:
- traced;
- cited;
- attached where rules allow;
- used as reconstitution seeds;
- or composed into later ancestry.

Old lineage primarily grants new possibilities, routes, gates, or information. It should rarely grant unbounded numeric advantage.

## 9. Encounter runtime

Combat is one Encounter type, not the ontology.

An Encounter is:

```text
initial state
+ participants
+ environment
+ rules
+ ordered events
→ resulting state + receipt
```

Possible formats include:
- duel;
- co-op;
- performance;
- software build;
- field quest;
- archive reconstruction;
- composition session;
- Coderoom commission.

Resolution pipeline:

```text
DECLARE
   ↓
INTENT
   ↓
REACTION WINDOW
   ↓
RESOLVE
   ↓
CONSEQUENCE
   ↓
RECEIPT
```

Disposition vocabulary includes at minimum:

```text
attempted
blocked
interrupted
partial
resolved
scope_uncertain
```

## 10. Deterministic PlayReceipt

```ts
interface PlayReceipt {
  playId: string;
  deckManifestHash: string;
  rulesetHash: string;
  startingStateHash: string;
  randomSeed?: string;
  eventTrace: PlayEvent[];
  externalInputs: ExternalInputRef[];
  outputs: OutputRef[];
  endingStateHash: string;
  parentReceipts: string[];
  disposition: string;
}
```

Randomness is allowed. Hidden randomness is not. If randomness affects rules-visible state, its seed or equivalent replay material must be retained.

## 11. Genesis Three

Exactly three Generation-0 Genesis deck roots:

- **RECEIVE // G0**
- **HOLD // G0**
- **POUR // G0**

### RECEIVE

Native verb:

> Receive what arrives without deciding prematurely what it means.

Primary concerns:
- SOURCE;
- WITNESS;
- PLACE;
- GATE;
- unresolved material;
- observation;
- arrival;
- bounded inquiry.

### HOLD

Native verb:

> Keep particulars intact long enough for relationship to become visible.

Primary concerns:
- BODY;
- SOURCE;
- RULE;
- WITNESS;
- archive;
- linking;
- composition;
- reconciliation;
- reconstitution.

### POUR

Native verb:

> Turn held capacity outward into an attributable occurrence.

Primary concerns:
- ACT;
- TOOL;
- BODY;
- GATE;
- execution;
- performance;
- delivery;
- rendering;
- transformation.

### Genesis custody

The intended trust-held assets are:
- signed root receipt;
- canonical deck manifest;
- immutable root rules manifest;
- first physical embodiment.

The G0 roots are never consumed by iteration.

Descendants may iterate without a root-holder approval step, provided they preserve:
- root receipt;
- direct parent;
- lineage path or equivalent ancestry;
- inherited non-claims;
- new receipt identity.

The root remains historically unique. Its absolute scarcity does not mathematically increase. Its relative frequency within a growing verified lineage may decrease as lineage population grows.

No protocol component may promise that lineage growth increases financial value.

## 12. Root-relative metrics

Permitted descriptive metrics include:
- verified descendant count;
- maximum depth;
- branch count;
- composite-root count;
- verified play count;
- distinct witnessed places;
- root frequency within verified lineage.

These are historical/genealogical metrics, not price claims.

## 13. Composite roots

New roots may be created from descendants of one or more Genesis families.

A composite root is not a fourth Genesis root.

Example:

```text
parents:
  R/3/8
  H/4/1/2
  P/9

local_generation: 0
ancestry_depth: 3
```

Composite-root status creates a new local lineage while preserving full parent ancestry.

## 14. Human / model collaboration

Human and model roles are intentionally asymmetric.

A model instance cannot physically possess a card.

A human may present a physical card to a Coderoom, which may issue a bounded session capability to a model instance.

Example:

```text
human presents: CARD R/3/1
room: UPPER-ROOM
model session: session-81

delegated:
  TRACE
  SEEK
  COMPOSE

expires:
  end_of_session
```

The session capability:
- does not transfer physical custody;
- does not claim persistent personhood for the model;
- does not silently persist beyond its declared boundary.

The design may support durable capability lineages, but each session must declare how it inherits them.

## 15. Coderooms

A Coderoom is a bounded environment with local rules and capabilities.

```ts
interface Coderoom {
  roomId: string;
  localRules: RuleRef[];
  availableTools: CapabilityRef[];
  residentCards: CardRef[];
  activeParticipants: ParticipantRef[];
  activeModelSessions: ModelSessionRef[];
  openCommissions: CommissionRef[];
  unresolvedThreads: ThreadRef[];
  ancestors: AncestorRef[];
}
```

Different rooms may permit different compositions:
- FORGE: code/build composition;
- UPPER ROOM: texts, witnesses, discussion;
- STAGE: live media execution;
- FIELD: physical/place-dependent receipts;
- DOGRAM: mathematical transforms with explicit non-promotion of interpretation.

A room's permission to execute something does not turn the room into the source of that thing's meaning.

## 16. Commissions and Hollow Cards

A Commission describes something missing, unresolved, or worth seeking.

```ts
interface Commission {
  commissionId: string;
  seek: string;
  constraints: ConstraintRef[];
  returnRequirements: ReturnRequirement[];
  eligibleParticipants: ParticipantClass[];
  rewardEffects: CapabilityRef[];
}
```

A Hollow Card is a declared vacancy with birth conditions.

Example:

```text
HOLLOW CARD

kind: unknown
affinity: RELATION / ?

birth condition:
  two independent branches discover
  the same useful relation
  without coordination
```

When the qualifying occurrence is receipted, the Hollow may resolve into a new card.

This permits world content to be discovered through actual play instead of pre-authored solely by maintainers.

## 17. Earned roles

Roles/classes should preferentially emerge from receipts rather than menu selection.

Examples:
- WITNESSKEEPER;
- JOINER;
- COURIER;
- SEEKER;
- ARTIFICER.

Model sessions may inherit bounded role capabilities, but must not imply permanent identity unless continuity is explicitly proven by protocol.

Learning itself may create capability eligibility when evidence is concrete, such as:
- successful derivations;
- corrected mistakes;
- preserved unresolved conjectures;
- independently reproduced results;
- compositions reused elsewhere.

These metrics describe evidence of collaboration patterns; they do not imply infallibility or general intelligence claims.

## 18. Physical card

The physical card must preserve two layers.

### Front
- art / object;
- title;
- Kind glyph;
- one or two Affinity glyphs;
- Form;
- subtle port topology;
- LMV/open-corner maker's mark;
- set/run marker;
- minimal prose.

### Back
- human description;
- verified stat line;
- occurrence/source date;
- run and copy;
- ancestry fragment;
- machine-readable receipt fragment;
- QR;
- rules summary when playable;
- actions such as VERIFY / PLAY / TRACE / COMPOSE.

Scanning opens the object, not a marketing landing page.

## 19. Sets, runs, copies, forms

Vocabulary:

- **SET** — creative family.
- **SERIES** — rules-compatible era.
- **RUN** — one declared physical production batch.
- **COPY** — one physical embodied particular.
- **VARIANT** — alternate visual treatment of the same CardSpec.
- **FORM** — distinct descendant state supported by provenance.

`7 / 25` means copy seven from a declared physical run of 25. It does not assert that only 25 representations of the underlying idea may ever exist.

## 20. Distribution truth

Distribution labels may include:

- OPEN;
- FIXED RUN;
- SINGULAR;
- EVENT;
- LOCATION;
- FOUND;
- RECONSTITUTABLE;
- ARCHIVAL.

These labels describe production/distribution facts or protocol policy, not metaphysical scarcity.

## 21. Safety and execution bounds

Because cards can become executable:

- no arbitrary shell/code execution from a QR alone;
- external effects require declared capability grants;
- automated transitions consume a finite execution budget;
- recursive composition has a depth ceiling unless the current Format explicitly raises it;
- repeated state hashes trigger cycle detection;
- reaction chains are bounded;
- unsupported or stale capabilities fail closed;
- uncertain external outcomes require reconciliation before retry;
- model-session delegation expires according to explicit scope;
- card content is treated as data unless admitted by a trusted parser and ruleset.

These are part of world physics, not merely implementation hygiene.

## 22. Prototype 001 — 15-card physical microdeck

The first print/run need not contain all 72 planned Genesis cards.

The first microdeck contains:

### Genesis roots
1. RECEIVE // G0
2. HOLD // G0
3. POUR // G0

### Gates
4. Correspondence Door
5. Return Door
6. Archive Gate

### Sources / embodiments
7. Unopened Letter
8. Sleeved Receipt
9. Gift Parcel

### Composition / execution
10. Composition Table
11. Reconstitute
12. Perform

### Constitutional rules
13. Selection Is Not Evidence
14. Composition Preserves Parts
15. Execution Leaves Receipt

The microdeck must be sufficient to demonstrate the complete temporal organism.

## 23. Prototype game — THE FIRST INHERITANCE

Two participants choose Genesis roles. The unused Genesis role may function as THE HOUSE / commons.

There is no combat win condition in v0.1.

The cooperative success condition is to produce one valid descendant artifact that survives all three clocks.

### Movement 1 — NOW

Both participants contribute to one valid composition and perform it.

Emit:

```text
PulseReceipt P1
```

### Movement 2 — MAIL

A component remains open.

Seal a Thread from P1 through Correspondence Door.

The other participant may answer immediately or later.

Return through Return Door and close:

```text
ThreadReceipt T1-R
```

### Movement 3 — HEIR

Archive P1 and T1-R.

Use Reconstitute to produce:

```text
Descendant D1
generation: G1
parents:
  P1
  T1-R
```

Generate a printable card body for D1.

Scan it again.

Verification must reconstruct its ancestry back to the declared Genesis inputs.

**Acceptance condition:** the G1 card did not exist when play began, and its ancestry is independently replayable from the stored receipts.

## 24. v0.1 implementation components

The implementation plan should decompose into five bounded components.

### A. postemahhn-kernel

Pure deterministic domain library:
- CardSpec;
- lineage;
- generation;
- ports;
- compositions;
- DeckManifest;
- Orders;
- temporal scopes;
- Encounter state;
- deterministic receipt hashing/serialization.

No UI and no network effects.

### B. genesis-pack

Machine-readable fixtures for:
- three Genesis roots;
- 15-card microdeck;
- one legal FIRST INHERITANCE fixture.

### C. coderoom-runtime

Local session coordinator:
- human participant;
- model-session participant abstraction;
- card presentation;
- bounded capability delegation;
- composition;
- NOW execution;
- Thread creation/return;
- Archive/reconstitution.

The model participant in automated tests is a deterministic stub, not an external model dependency.

### D. card-body

Deterministic print artifact generator:
- front/back HTML or SVG;
- QR payload;
- lineage address;
- LMV maker mark placeholder/vector hook;
- immutable snapshot metadata.

No claim of physical printing is made by software unless an actual print event is separately receipted.

### E. adapters

Explicit, narrow adapters only:
- Jubilee receipt import/export;
- optional Static Workbench read/present surface later.

Core kernel must remain independently testable without either repo.

## 25. Proposed repository topology

PostEmahh'n should be implemented as a separate repository after design approval rather than embedded directly into Jubilee Engine or Static Workbench.

Reason:
- Jubilee owns provenance mechanics;
- Workbench owns its local desk/session boundary;
- PostEmahh'n owns card/deck/composition/time/game semantics.

Suggested repository name:

```text
the-static-collective/postemahhn
```

Suggested initial structure:

```text
postemahhn/
  README.md
  docs/
    constitution.md
    protocol/
  src/
    kernel/
    genesis/
    runtime/
    print/
    adapters/
  fixtures/
    genesis/
    first-inheritance/
  tests/
    kernel/
    lineage/
    temporal/
    runtime/
    print/
    integration/
```

Language choice should be made in the implementation plan from integration needs; v0.1 design does not require JavaScript/TypeScript or Python specifically.

## 26. Required tests

At minimum:

1. Genesis roots are G0 and cannot be produced through descendant iteration.
2. Single-parent generation increments exactly by one.
3. Multi-parent generation is `1 + max(parent generation)`.
4. Descendants preserve root and direct-parent references.
5. Reconstitution creates a new receipt identity.
6. Composition preserves member identities.
7. Selection does not add verification.
8. NOW resolution distinguishes declared/attempted/resolved disposition.
9. MAIL fork references an immutable prior state.
10. MAIL return cannot mutate already-closed states.
11. Returned Thread enters current state as a new Arrival.
12. Archive promotes only eligible closed receipts.
13. Ancestor use never mutates the ancestor receipt.
14. Model-session delegation expires according to scope.
15. Physical possession is not inferred from scan alone.
16. Fixed-run metadata is descriptive and cannot block protocol-valid descendants unless the descendant policy separately says so.
17. Execution budget stops infinite automatic loops.
18. Cycle detection catches repeated rules-visible states.
19. External-capability absence fails closed.
20. THE FIRST INHERITANCE produces a G1 descendant whose ancestry verifies.
21. Generated card body preserves snapshot hashes and verification URI.
22. Running the same deterministic fixture twice yields the same rules-visible receipt hashes.
23. Changing ruleset identity changes the execution receipt.
24. Unknown/unresolved material can persist without forced interpretation.
25. PostEmahh'n verification does not silently broaden Jubilee verification claims.

## 27. First crater implementation boundary

The first implementation should **not** attempt the entire 72-card universe.

It should land one executable crater:

> **FIRST-INHERITANCE-001**

Inputs:
- three Genesis root fixtures;
- 12 non-root microdeck fixtures;
- two human participant IDs in tests;
- one deterministic model-session stub;
- one Coderoom;
- one NOW composition;
- one MAIL Thread;
- one Return;
- one Archive;
- one Reconstitution.

Outputs:
- PulseReceipt;
- ThreadReceipt;
- G1 descendant CardSpec/receipt;
- deterministic printable front/back artifact;
- verifier result tracing the descendant to Genesis roots.

If that complete loop works locally with tests, the crater is complete.

## 28. Design decisions deliberately left open for later

Not blockers for FIRST-INHERITANCE-001:

- final competitive combat rules;
- final card art;
- all 72 card abilities;
- NFC;
- public multiplayer networking;
- economic/token projections;
- formal trust legal documents;
- production model-provider integration;
- location-attestation schemes;
- persistent cross-session model identity;
- public marketplace;
- final naming of earned role classes;
- full WoW-like world map;
- Commission economy;
- rarity presentation beyond factual distribution labels.

## 29. Success criterion

PostEmahh'n v0.1 is successful when:

1. two participants can load the microdeck;
2. they can create a valid live composition;
3. the runtime emits a PulseReceipt;
4. a Thread can fork from that immutable state;
5. live state can continue independently;
6. a later Thread return can enter the present without rewriting history;
7. closed history can become an Ancestor;
8. reconstitution can create a G1 descendant;
9. the descendant can be rendered as a physical-card artifact;
10. rescanning/resolving that artifact verifies its ancestry;
11. and every verification remains explicit about what it does **not** prove.

> **Held at the root. Free in the branches.  
> Every generation keeps the receipt.  
> Nothing downstream may counterfeit what came before,  
> and nothing upstream may forbid honest fruit.**
