# nuThang — Book of Acts / nuBlockV.V Design

**Status:** APPROVED ARCHITECTURAL DESIGN  
**Date:** 2026-09-18  
**Host:** Jubilee Engine VM  
**Profile:** `nuThang/book-of-acts/v0`  
**Implementation status:** design only; no runtime, token, monetary, securities, training, or network authority is created by this document.

> **DO NOT TOKENIZE PEOPLE. RECEIPT ACTS.**
>
> **THE PARTICULAR SURVIVES EVERY PROJECTION.**
>
> **THE LEDGER REMEMBERS WHAT HAPPENED. THE COMMUNITY DECIDES WHAT IT MEANS.**

---

## 1. Purpose

nuThang is a Jubilee Engine architecture for preserving attributable human and community acts as irreducible particulars before any economic, reputational, organizational, statistical, or AI interpretation is applied.

Its first profile is **Book of Acts / nuBlockV.V**.

The name is a design aperture, not an exegetical claim. "Acts" means that the historical substrate is built from attributable acts and their consequences rather than balances or abstract token transfers. "Book" means that those acts remain inspectable as a history. "nuBlockV.V" names the attempt to redesign blockchain and token-economic assumptions from the Jubilee Engine's provenance, local-authority, non-erasure, and projection discipline.

The central inversion is:

```text
conventional ledger emphasis:
    scarce units
    balances
    transfers
    ordering
    consensus
    token economics

nuThang emphasis:
    irreducible particulars
    attributable acts
    bounded occurrences
    witnesses
    receipts
    consequences
    demonstrated capacity
    optional later projections
```

The ledger exists to preserve accountable history.

The token, if any, is only one replaceable projection over that history.

---

## 2. Existing Jubilee inheritance

nuThang is not a separate crypto island.

It is hosted by Jubilee Engine VM because the VM already owns several required laws and executable ideas:

- deterministic compilation;
- append-only/non-erasure graph formation;
- cryptographically attributable receipt identity;
- reproducible projections;
- bounded compiler identity;
- nested execution domains;
- the law that one VM may witness another without inheriting the other's authority.

It also composes with, but does not absorb, existing neighboring Jubilee organs.

### Jubilee Campfire

Campfire contributes the human-scale cycle:

```text
OFFER -> JOIN -> REMEMBER
```

and the hypothesis that local communities contain latent capacities which become more useful when they are visible, addressable, and joinable.

nuThang extends the history layer between JOIN and REMEMBER:

```text
OFFER
  -> JOIN
  -> ACT
  -> WITNESS
  -> RECEIPT
  -> REMEMBER
  -> CAPACITY
```

### Jubilee Authority Kit

Authority Kit contributes reusable laws:

```text
no transition without a receipt
actor cannot enlarge received authority
refusal is first-class
projections are not the ledger
local formation remains local until offered
```

nuThang consumes those laws. It does not make Authority Kit own economics, human value, community policy, or the meaning of an act.

### Project0 / TranchNode / ALEX / 3rdi / Dogram / BODY

These neighboring systems pressure the design but do not become runtime dependencies merely because the ideas align.

The relevant inherited pressures are:

```text
source != interpretation
occurrence != projection
receipt != authority
witness != verdict
selection != evidence
calculation != meaning
local chart != global body
compatibility != permission
```

nuThang adds:

```text
act != value
contribution != worth
receipt != token
token != money
capacity != status
community memory != AI training consent
economic projection != historical ledger
consensus on occurrence != consensus on meaning
```

---

## 3. Primary law: irreducible particulars first

The unit of preservation is not a score, balance, reputation number, narrative summary, or model feature.

It is an attributable particular.

A useful future system may eventually derive:

- capacity estimates;
- local routing suggestions;
- mutual credit;
- project-specific credits;
- contribution marks;
- resource claims;
- research aggregates;
- model features;
- planning hypotheses;
- organizational body projections.

None of those derived objects is allowed to erase the particulars from which it arose.

The design therefore uses this direction:

```text
PARTICULARS
    -> RELATIONS
    -> PATTERNS
    -> OPTIONAL PROJECTIONS
```

and refuses:

```text
MODEL PATTERN
    -> INVENTED PARTICULARS
```

### 3.1 Why particulars matter

Capture-time relevance is unknowable.

An apparent "successful grocery delivery" may include distinctions that matter later:

- who supplied transport;
- whether another vehicle was required;
- what could not be sourced;
- whether the recipient changed the request;
- whether refrigeration became a constraint;
- whether a refusal changed the route;
- which part was observed directly;
- which part was reported later;
- what artifact or receipt resulted;
- what subsequent project reused the demonstrated capacity.

Compressing those into one scalar destroys future explanatory power.

Therefore:

> **Preserve particulars; make projections disposable.**

---

## 4. Core object model

The v0 architecture separates six object families.

```text
ParticularAct
ActReceipt
nuBlock
CapacityEvidence
EconomicProjection
AIUseGrant
```

Only the first three are required for the initial executable slice.

Capacity, economics, and AI use remain downstream projections.

---

## 5. ParticularAct

A `ParticularAct` is a bounded description of an attributable occurrence.

It is not required to contain every fact about a human event. It contains only what the application has a declared reason and permission to preserve.

Conceptual shape:

```ts
type ParticularActV0 = {
  schema: "nuthang.particular-act/0.1"

  actId: string

  subject: {
    kind: string
    ref: string
  }

  needRefs: string[]
  offerRefs: string[]
  joinRefs: string[]

  participants: Array<{
    actorRef: string
    declaredCapacity?: string
    contributionRefs: string[]
  }>

  occurrences: Array<{
    occurrenceRef: string
    kind: string
    evidenceClass:
      | "observed"
      | "reported"
      | "derived"
      | "unresolved"
    sourceRefs: string[]
  }>

  constraints: Array<{
    constraintRef: string
    kind: string
    sourceRefs: string[]
  }>

  artifactRefs: string[]
  witnessRefs: string[]

  disposition:
    | "attempted"
    | "partial"
    | "scoped_complete"
    | "refused"
    | "composted"
    | "unresolved"

  residualFog: string[]

  disclosure: DisclosurePolicyV0
}
```

This shape is conceptual until implementation work freezes exact field names.

### 5.1 No exhaustive telemetry

Particular does not mean maximal surveillance.

The system MUST NOT assume that useful history requires recording:

- continuous location;
- ambient microphone data;
- private messages unrelated to the act;
- biometric state;
- inferred emotion;
- inferred moral intent;
- browsing behavior;
- every intermediate movement;
- every person who was nearby.

The particular remains **bounded by declared relevance and disclosure**.

```text
irreducible particular
!=
totalizing record
```

---

## 6. Evidence class stays local

Every occurrence-level claim must preserve how it became available.

At minimum:

```text
OBSERVED
    directly witnessed under a declared instrument or witness boundary

REPORTED
    stated by an attributable participant/source

DERIVED
    computed from retained inputs under an attributable transformation

UNRESOLVED
    present but not lawfully classified
```

No aggregate operation may silently upgrade:

```text
reported -> observed
derived -> observed
repeated -> true
popular -> authoritative
```

This is critical for both economics and future AI use.

---

## 7. ActReceipt

An `ActReceipt` is a content-addressed witness that a particular act representation was admitted under an explicit compiler/profile identity.

It does not state that the act was morally good, economically valuable, legally valid, socially important, or spiritually meaningful.

Conceptual shape:

```ts
type ActReceiptV0 = {
  schema: "nuthang.act-receipt/0.1"

  receiptId: string
  actDigest: string

  profile: "nuthang/book-of-acts/v0"

  compilerIdentity: CompilerIdentity

  participantRefs: string[]
  witnessRefs: string[]
  sourceRefs: string[]

  disposition: ParticularActV0["disposition"]

  previousReceiptRefs: string[]

  claims: {
    admittedParticularDigest: true
    deterministicIdentity: true
  }

  doesNotClaim: string[]
}
```

Every v0 receipt MUST include explicit non-claims equivalent to:

```text
receipt != human worth
receipt != legal validity
receipt != economic value
receipt != token entitlement
receipt != authority
receipt != consensus on meaning
receipt != AI training consent
```

---

## 8. nuBlockV.V

A nuBlock is not primarily a batch of token transactions.

It is a **closed bounded occurrence envelope**.

The closure question is:

> Has this occurrence reached a disposition that can be receipted without pretending unresolved parts are solved?

Conceptually:

```text
nuBlock N_i =
(
  subject,
  particulars,
  acts,
  witnesses,
  artifacts,
  receipts,
  disposition,
  residual fog,
  lineage
)
```

### 8.1 Closure

A block may close as:

```text
attempted
partial
scoped_complete
refused
composted
unresolved
```

Closure does not require success.

A failed or refused project may produce useful history.

Example:

```text
need:
    wheelchair ramp

available:
    carpentry labor
    lumber
    volunteers

attempt:
    blocked by permit requirement

disposition:
    partial

historical consequence:
    carpentry capacity demonstrated
    permit-navigation gap discovered
```

The block is useful precisely because it preserves the failed crossing rather than dropping it from the dataset.

### 8.2 No false completeness

A nuBlock MUST NOT close by converting unknowns into defaults.

```text
missing witness != witnessed no
unresolved outcome != failure
lack of economic projection != zero value
no token != no contribution
```

---

## 9. Chain semantics

The historical substrate is a graph with receipted ancestry.

It need not be one global chronological chain.

A nuBlock may refer to:

- prior needs;
- prior offers;
- prior acts;
- prior capacity evidence;
- prior artifacts;
- prior refusals;
- previous blocks whose particulars were reused.

The implementation should prefer a content-addressed DAG/multigraph representation compatible with Jubilee Engine's existing graph and receipt model.

### 9.1 Ordering

The first implementation does not need global ordering.

It needs deterministic local ancestry.

```text
causal/order relation when witnessed
!=
total global order
```

If two independent communities act concurrently, nuThang does not invent an arbitrary universal ordering merely to resemble a conventional blockchain.

---

## 10. Consensus redesign

Conventional blockchains often ask:

> Which transaction history is canonical?

Book of Acts asks a narrower question:

> Which bounded facts about this occurrence have enough attributable support to enter this receipt under this profile?

Possible agreement can concern:

- participant references;
- exact artifacts;
- timestamps under a declared clock source;
- submitted contributions;
- admitted disposition;
- witness receipts;
- causal ancestry.

Agreement does not automatically extend to:

- whether the act was good;
- whether it was wise;
- why a person acted;
- whether someone deserves status;
- what doctrinal or political meaning follows;
- whether an economic reward should be issued;
- whether a model should train on it.

Therefore:

```text
CONSENSUS ON OCCURRENCE
!=
CONSENSUS ON MEANING
```

No distributed consensus protocol is required for v0.

The first specimen uses deterministic local compilation over supplied particulars and witness evidence.

---

## 11. CapacityEvidence

Capacity is a projection over receipted history.

It is not human status.

Conceptually:

```ts
type CapacityEvidenceV0 = {
  schema: "nuthang.capacity-evidence/0.1"

  capacityKind: string
  scopeRef: string

  supportingReceiptRefs: string[]

  observedBounds: Array<{
    dimension: string
    value: unknown
    unit?: string
  }>

  residualFog: string[]

  nonAuthorities: string[]
}
```

Example:

```text
declared capacity:
    grocery delivery

observed backing:
    14 act receipts
    3 completed scoped projects
    7 attributable participants

does not claim:
    future availability
    universal reliability
    moral worth
    employment qualification
    authority over volunteers
```

### 11.1 BODY relationship

This creates a future bridge to BODY without making nuThang own BODY.

A body surface may eventually distinguish:

```text
DECLARED:
    this organ says it can do X

OBSERVED:
    these retained act receipts demonstrate bounded prior X-like capacity
```

But:

```text
historical capacity != present availability
historical capacity != obligation
capacity evidence != BODY authority
```

---

## 12. EconomicProjection

Economics is a downstream garment.

The irreducible history exists before the economic interpretation and survives if that interpretation changes or disappears.

Conceptually:

```ts
type EconomicProjectionV0 = {
  schema: "nuthang.economic-projection/0.1"

  policyRef: string
  sourceReceiptRefs: string[]

  projectionKind:
    | "mutual-credit"
    | "contribution-mark"
    | "project-credit"
    | "resource-claim"
    | "other"

  issuedClaims: unknown[]

  nonAuthorities: string[]
}
```

This is not part of the first executable implementation.

### 12.1 Economic laws

```text
ACT != VALUE
CONTRIBUTION != WORTH
RECEIPT != TOKEN
TOKEN != MONEY
MONEY != MORAL STATUS
ECONOMIC CLAIM != HUMAN CLAIM
```

A policy may say:

> these receipt classes back this particular economic instrument.

It may not rewrite the underlying act.

### 12.2 No automatic mint

A completed act MUST NOT automatically mint a transferable asset.

Reasons include:

- Goodhart pressure;
- sybil farming;
- circular contribution loops;
- labor-category bias;
- commodification of care;
- coercive participation;
- reputation concentration;
- perverse incentives toward countable acts;
- social ranking.

Any future issuance path requires a separately admitted economic policy.

### 12.3 Replaceable economics

Different communities may project different economic systems over the same historical substrate.

```text
Community A:
    no economic projection

Community B:
    mutual credit

Community C:
    non-transferable contribution marks

Community D:
    project-specific redeemable credits
```

Shared act history does not imply shared economics.

---

## 13. Anti-social-credit boundary

nuThang MUST NOT create a universal human score.

Forbidden core outputs include:

```text
good-person score
community-worth score
moral rank
spiritual rank
citizenship rank
universal trustworthiness
obedience score
deservingness score
```

A narrow capability projection may say:

> these receipts demonstrate previous participation in grocery delivery under these conditions.

It may not infer:

> therefore this person is a better citizen.

This boundary applies even if downstream users request a scalar because scalar scoring is convenient.

---

## 14. AI-use architecture

The same particular-rich history that supports community memory could become unusually valuable future AI material.

That does not create permission to use it.

The core law is:

```text
RECEIPTED FOR COMMUNITY MEMORY
!=
CONSENTED FOR MODEL TRAINING
```

### 14.1 AIUseGrant

AI use is separately declared.

Conceptual capability classes:

```text
local_retrieval
bounded_inference
aggregate_analysis
evaluation
model_training
public_research
```

A grant MUST name:

- subject/scope;
- permitted use class;
- recipient/system where relevant;
- duration or revocation semantics where meaningful;
- disclosure/transformation constraints;
- whether raw particulars may leave the local boundary.

### 14.2 No upward inheritance

Permission must not automatically widen:

```text
local retrieval
    X=> model training

aggregate analysis
    X=> raw-data export

community memory
    X=> public research

public receipt ID
    X=> public payload
```

### 14.3 Revocation and historical truth

A future design must distinguish:

- revoking future AI use permission;
- deleting locally deletable payloads;
- preserving the historical fact that a grant once existed;
- immutable/public artifacts that cannot honestly be recalled.

v0 does not solve distributed deletion. It must not falsely claim that it does.

---

## 15. Future AI value

nuThang's AI value is not "more text."

It is retained **formation and consequence history**.

Ordinary corpora often expose:

```text
final answer
final document
final code
final song
final policy
```

while discarding:

```text
what need existed
what options were available
what was refused
what failed
which evidence existed then
what authority existed then
what changed
what consequence followed
what was learned only later
```

Book of Acts attempts to retain those distinctions.

That enables future questions such as:

- Have we solved something structurally similar before?
- Which constraint repeatedly blocks this class of project?
- Which local capacities are historically demonstrated but currently disconnected?
- Which interventions produced durable capacity rather than one-off completion?
- Which earlier conclusions relied on evidence that was not available at the time?
- Which act patterns recur across otherwise different communities?

The AI may propose patterns.

The particular history remains the source substrate.

```text
AI learns from history
!=
AI becomes historian of record
```

---

## 16. Temporal provenance

Book of Acts inherits the temporal pressure discovered in BODY-PULSE.

The system must distinguish:

```text
SUBJECT OCCURRENCE
    when the described act/event happened

DECLARATION OCCURRENCE
    when a relevant declaration became attributable

APPLICATION OCCURRENCE
    when a compiler/projection applied a declaration to the subject

LATER KNOWLEDGE
    facts discovered after the subject occurrence
```

A later declaration may lawfully describe an earlier act without pretending it existed then.

Likewise later evidence may change what a projection can say without rewriting the historical information available at the original occurrence.

Therefore:

```text
RETROSPECTIVE APPLICABILITY
!=
CONTEMPORANEOUS AVAILABILITY
```

and:

```text
BODY/AI/ECONOMIC DELTA
!=
WORLD DELTA
```

Sometimes a projection changes because knowledge changed.

v0 should preserve enough coordinates to prevent chronology laundering, but should not build a general temporal database.

---

## 17. Privacy and selective memory

nuThang's value comes from high-quality particulars, not maximum collection.

The default posture is:

```text
collect the smallest particulars needed
to preserve the accountable act
```

The disclosure layer should eventually support distinctions such as:

```text
private/local
named-circle
cross-circle receipt only
cross-circle selected payload
aggregate only
public
```

The public existence of a receipt identifier does not automatically make every underlying payload public.

Sensitive-domain adapters may require stronger policies.

---

## 18. Identity

v0 does not require a global human identity system.

Actor references are attributable identifiers within a bounded domain.

```text
actorRef
!=
legal identity
!=
government identity
!=
universal person identifier
```

Identity authentication may be provided by another system.

The receipt must state what identity assurance it does and does not possess.

This avoids making nuThang a biometric, KYC, citizenship, or universal-ID project.

---

## 19. Proof-of-work inversion

nuThang is interested in useful work, but MUST NOT use "proof of useful work" as a shortcut to human valuation.

Three narrow concepts may eventually be distinguished:

```text
PROOF OF ACT
    attributable evidence that an act occurrence was admitted

PROOF OF CONTRIBUTION
    attributable evidence that an act fulfilled a predeclared contribution relation

PROOF OF CAPACITY
    bounded historical evidence that one capability has been demonstrated
```

None means:

```text
PROOF OF GOOD PERSON
```

The system rewards no one merely because a classifier calls their behavior useful.

---

## 20. Relationship to conventional blockchain mechanisms

nuBlockV.V is allowed to reuse cryptographic primitives where useful:

- content hashes;
- Merkle structures;
- signatures;
- append-only logs;
- replication;
- deterministic execution;
- capability-scoped validation;
- distributed verification.

It is not required to inherit:

- proof-of-work mining;
- proof-of-stake governance;
- global mempools;
- universal token issuance;
- one canonical total ordering;
- speculative asset markets;
- gas fees;
- anonymous transfer semantics;
- irreversible public disclosure.

The question is always:

> Does this mechanism preserve attributable particulars and lawful local autonomy?

If not, conventionality is not a reason to adopt it.

---

## 21. Relationship to Jubilee Engine VM

The first implementation should treat Book of Acts as a **profile/compiler domain** inside Jubilee Engine VM.

Host responsibilities:

```text
Jubilee Engine VM
    deterministic canonicalization
    content addressing
    receipt generation
    compiler identity
    projection reproducibility
    verification
```

Profile responsibilities:

```text
Book of Acts
    particular-act vocabulary
    disposition grammar
    bounded occurrence closure
    act receipt non-claims
    specimen fixtures
    hostile controls
```

The profile MUST NOT rewrite existing VM receipt semantics.

Where existing generic Jubilee receipts are sufficient, Book of Acts should wrap/reference them rather than invent a parallel cryptographic substrate.

---

## 22. Relationship to Jubilee Campfire

Campfire is the first intended domain adapter, not the owner of nuThang.

Mapping:

```text
Campfire Need / Seed
    -> Book of Acts subject

Campfire Offer
    -> offerRef

Campfire Pledge / Join
    -> joinRef / declared contribution

reported action
    -> ParticularAct occurrence

Campfire Receipt
    -> may be referenced by ActReceipt

harvested Capacity
    -> future CapacityEvidence projection
```

The first nuThang specimen will be domain-shaped like Campfire without requiring a production Campfire integration.

The integration should happen only after the profile proves itself independently.

---

## 23. Relationship to Human Witness

Human Witness may eventually provide high-quality witness evidence for deliberate acts:

- declare;
- assent;
- witness;
- refuse;
- revoke;
- accept capacity.

nuThang does not absorb those semantics.

```text
Human Witness receipt
    -> evidence input

nuThang ActReceipt
    -> bounded act-history receipt

Human Witness receipt
!=
nuThang economic claim
```

---

## 24. Relationship to BODY

BODY can later consume capacity evidence and project local capability topology.

Potential flow:

```text
receipted acts
    -> CapacityEvidence
    -> owner/local BODY surface evidence
    -> no-promotion BODY projection
```

But BODY remains a projection.

A highly connected actor, group, project, or capability must not become more authoritative merely because graph centrality is high.

```text
centrality != canon
historical activity != authority
capacity evidence != obligation
```

---

## 25. First executable specimen — grocery delivery

The first specimen must be intentionally ordinary.

### 25.1 Subject

```text
need:
    one family needs a grocery delivery
```

### 25.2 Available contributions

```text
offer A:
    vehicle + driver

offer B:
    grocery contribution

offer C:
    two volunteer hours
```

### 25.3 Join

Three participants join the bounded project.

### 25.4 Occurrence

```text
pickup
transport
delivery
```

A requested item is unavailable.

The item substitution is not silently treated as exact fulfillment.

### 25.5 Disposition

```text
scoped_complete
```

only if the specimen's declared scope permits the missing item to remain an explicit exception.

Otherwise:

```text
partial
```

The test fixture must make the scope explicit so the compiler cannot guess.

### 25.6 Receipt

The resulting receipt preserves:

- exact input particular digest;
- participant references;
- contribution references;
- unavailable-item constraint;
- witness references;
- disposition;
- residual fog;
- compiler identity;
- non-claims.

### 25.7 No economics

The first specimen has:

```text
economic projection: NONE
AI training permission: NONE
```

The act remains a valid act-history specimen.

---

## 26. Second specimen — economic garment without history mutation

The second specimen reuses the exact first act receipt.

It adds a separate synthetic economic policy which says that a subset of eligible act receipts may back one non-transferable project credit.

Acceptance conditions:

1. the underlying act receipt digest does not change;
2. the economic projection has its own identity;
3. removing the economic projection leaves the act history valid;
4. changing economic policy changes the projection identity, not the act identity;
5. economic issuance does not create new witness claims about the original act;
6. no human-worth score exists anywhere in the fixture.

This proves:

```text
ECONOMIC GARMENT
!=
HISTORICAL BODY
```

---

## 27. Third specimen — AI permission separation

The third specimen uses the same act history.

The participant/community permits local retrieval but refuses model training.

Acceptance conditions:

1. local retrieval grant may reference the act;
2. training authorization remains absent/refused;
3. the act remains in lawful local community memory;
4. a model-training projection must fail closed without the required grant;
5. refusing training creates no negative reputation/economic consequence;
6. no permission is inferred from public metadata alone.

This proves:

```text
COMMUNITY MEMORY
!=
TRAINING CONSENT
```

---

## 28. Hostile controls

The first implementation must include hostile fixtures proving at least:

### 28.1 Particular/history

- same summary with different particulars produces different act identity;
- same participants with different disposition produces different receipt;
- changing a constraint changes the receipt;
- removing residual fog cannot preserve the same receipt identity;
- a derived claim cannot masquerade as observed evidence.

### 28.2 Economics

- act receipt does not automatically mint;
- duplicated/replayed receipt cannot mint twice under a one-shot policy;
- policy change changes economic projection identity;
- copied economic projection is not authority to issue another one;
- high contribution count does not produce human-worth score.

### 28.3 AI permission

- local retrieval permission does not authorize training;
- aggregate-analysis permission does not authorize raw payload export;
- no grant fails closed;
- revoked future permission cannot be silently treated as still open;
- denial of AI use does not mutate the historical receipt.

### 28.4 Temporal provenance

- later declaration applied to earlier act is distinguishable from contemporaneous declaration;
- later evidence does not rewrite what was known at subject occurrence;
- stale policy provenance cannot be silently presented as current.

### 28.5 Authority

- witness count does not grant execution authority;
- economic issuance does not grant BODY authority;
- capacity evidence does not create obligation;
- consensus on occurrence does not canonize interpretation.

---

## 29. First implementation slice

The first implementation slice is intentionally narrower than this full design.

It should implement only:

```text
ParticularActV0
ActReceiptV0
nuBlock closure/disposition
deterministic canonicalization
content-addressed identity
verification
grocery-delivery specimen
hostile particular/authority controls
```

It should NOT initially implement:

```text
transferable tokens
money
mutual credit
wallets
markets
blockchain networking
distributed consensus
mining/staking
AI model training
capacity scoring
BODY integration
Human Witness integration
Campfire production integration
global identity
public-chain publication
```

The second and third specimens may initially exist as design fixtures/tests against projection boundaries after the core receipt substrate is proven.

---

## 30. Suggested module boundary

The implementation plan should prefer a small profile boundary such as:

```text
src/
  profiles/
    bookOfActs/
      types.ts
      canonicalize.ts
      compileAct.ts
      verifyReceipt.ts
      fixtures/
      *.test.ts
```

Exact paths must be reconciled with the live Jubilee Engine VM codebase during implementation planning.

The profile should depend on generic Jubilee primitives where they exist instead of duplicating compiler/receipt machinery.

---

## 31. Verification target

The smallest successful command should prove:

```text
input particular
    -> deterministic canonical form
    -> receipt
    -> independent verification
    -> same input/profile/compiler reproduces same identity
```

and hostile changes must produce either:

- a different receipt identity; or
- explicit refusal.

No fixture may pass by silently discarding a changed particular.

---

## 32. Design invariants

The following are v0 design invariants.

```text
THE PARTICULAR SURVIVES EVERY PROJECTION

ACT != VALUE
CONTRIBUTION != HUMAN WORTH
RECEIPT != TOKEN
TOKEN != MONEY
CAPACITY != STATUS

CONSENSUS ON OCCURRENCE
!=
CONSENSUS ON MEANING

COMMUNITY MEMORY
!=
AI TRAINING CONSENT

ECONOMIC PROJECTION
!=
HISTORICAL LEDGER

PROOF OF ACT
!=
PROOF OF GOOD PERSON

FAILED / REFUSED / PARTIAL
!=
NO HISTORY

NO ECONOMIC PROJECTION
!=
ZERO VALUE

NO AI GRANT
!=
NO COMMUNITY MEMORY

WITNESS
!=
VERDICT

RECEIPT
!=
AUTHORITY

CENTRALITY
!=
CANON
```

---

## 33. Non-goals

Book of Acts v0 is not:

- a cryptocurrency launch;
- an ICO/token sale;
- a security or investment product;
- a bank;
- a payment processor;
- a universal reputation platform;
- a social-credit system;
- a government identity layer;
- a moral classifier;
- a church membership authority;
- a legal-validity engine;
- a public blockchain;
- a surveillance ledger;
- a training-data marketplace;
- a DAO governance system;
- an automatic charity-allocation engine;
- a proof that every act should be permanent.

Those may not be inferred merely because the project discusses economics, receipts, or token projections.

---

## 34. Evaluation questions

Before any later feature graduates, ask:

1. What irreducible particular does this preserve?
2. What information does it intentionally not preserve?
3. What authority is required to admit the act?
4. Which evidence classes are involved?
5. Does any projection destroy or overwrite source particulars?
6. Does an economic interpretation leak backward into historical truth?
7. Could the feature become a human-worth score?
8. Does community participation accidentally grant AI use?
9. Can refusal and partial completion remain visible?
10. Does chronology remain honest?
11. Can a community choose a different economic projection without rewriting history?
12. Can the particular remain useful if every optional projection is deleted?
13. Can a future model inspect source particulars instead of trusting today's compressed feature?
14. Does this remain Jubilee, or are we rebuilding conventional crypto under new names?

---

## 35. Success criterion

Book of Acts v0 succeeds when Jubilee Engine VM can prove one small statement:

> **Given a bounded set of attributable particulars describing a human/community act, the engine can create and independently verify a deterministic receipt that preserves those particulars and their disposition without assigning human worth, issuing money, manufacturing authority, or inheriting AI-use permission.**

Everything else is downstream.

---

## 36. Compact architecture

```text
           REAL-WORLD / DOMAIN OCCURRENCE
                       |
                       v
             IRREDUCIBLE PARTICULARS
                       |
                       v
                PARTICULAR ACT
                       |
                       v
              DETERMINISTIC ADMISSION
                       |
                       v
                 ACT RECEIPT
                       |
                       v
                    nuBLOCK
              bounded occurrence
                 disposition
                       |
          +------------+-------------+
          |            |             |
          v            v             v
       CAPACITY      ECONOMIC       AI-USE
      PROJECTION     PROJECTION    PROJECTION
          |            |             |
          +------------+-------------+
                       |
                   OPTIONAL
                       |
                 NEVER BACKWRITE
                       |
                       v
             ORIGINAL PARTICULARS
                 STILL PRESENT
```

---

## 37. Working seals

> **DO NOT TOKENIZE PEOPLE. RECEIPT ACTS.**

> **THE LEDGER EXISTS FOR THE HISTORY. THE HISTORY DOES NOT EXIST FOR THE TOKEN.**

> **PRESERVE THE PARTICULAR; LET ECONOMICS BE A GARMENT.**

> **AI MAY LEARN FROM HISTORY WITHOUT BECOMING THE HISTORIAN OF RECORD.**

> **A COMMUNITY MAY REMEMBER AN ACT WITHOUT SELLING THAT ACT TO A MODEL.**

> **THE PARTICULAR SURVIVES EVERY PROJECTION.**
