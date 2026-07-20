# Jubilee Engine VM (v3.2.4-reproducibility)

A formal, deterministic, non-erasure graph engine for stable multi-graph compilation, DAG projection, and cryptographically verifiable receipt generation.

---

## 📖 Introduction

**Jubilee Engine VM** is a sovereign, capability-scoped provenance engine. Unlike traditional destructive-write state machines, the Jubilee model operates on an append-only graph database representing historical assertion paths (claim manifests). 

During compilation, raw claims are processed against structured policies by a deterministic compiler identity to produce canonical multi-graphs. These graphs are then projected into specialized Directed Acyclic Graphs (DAGs) representing two primary semantic planes:
1. **Execution Projection**: A strict causal pipeline tracing data and task dependencies.
2. **Ontology Projection**: An associative structural hierarchy capturing type derivations, classifications, and relationships.

This playground is a highly interactive, full-fidelity simulator for developing, analyzing, compiling, and verifying Jubilee multi-graph topologies.

---

## ⚙️ Core Architectural Invariants

- **Claim Manifests**: Uniquely identified assertions with edge hashes, input/output structures, and type metadata.
- **Dual-Projection Integrity**: 
  - Every compiled topology must safely project into an Execution DAG and an Ontology DAG.
  - Cycle detection algorithms dynamically run in real time. If a cycle is detected, compilers attribution metrics are computed to resolve feedback loops or reject the compilation.
- **Sovereignty Check**: Strict adherence to cluster configuration and independent verification bounds.

---

## 🔐 v3.2.4 Reproducibility Standard

Version `v3.2.4` freezes the **reproducibility and standalone verification standard** for Jubilee receipts. 

### 1. Unified Compiler Identity
Compilers are no longer identified by simple strings. The unified `CompilerIdentity` struct incorporates:
- `compiler_name`: The canonical identity.
- `compiler_version`: Semantic release tags (e.g., `v3.2.4-reproducibility`).
- `compiler_hash`: Static hash of the compiler executable/binary.
- `policy_engine_hash`: Cryptographic fingerprint of the internal policy rule engine.
- `schema_hash`: Deterministic hash of the claim and ontology definition schema.
- `adapter_map_version` & `adapter_map_hash`: Identifiers for the pipeline maps translating edge topologies.

### 2. Standalone Verification Receipts
When compilation completes, the compiler generates a `TopologyReceipt` containing:
- Stable multi-graph hashes.
- Claims hash & Policy hash.
- Unified compiler identity metadata.
- Execution and Ontology projection hashes.
- Validation reports.

### 3. Projection Stability Certificates
The stand-alone verifier reconstructs state from raw inputs and checks execution identity. If the inputs reproduce the exact receipt outputs, the verifier issues a **Projection Stability Certificate** asserting that:
1. The receipt content matches the declared parameters.
2. Parent receipts are fully resolved and intact.
3. Supplied claims and policies reproduce the target projections.
4. Projection outputs satisfy their respective DAG requirements.

---

## 🛡️ Verifier Threat Model (`evidence/verification-scope.json`)

To prevent future systems or secondary layers from accidentally expanding the scope or semantic meaning of historical certificates, we establish an explicit verifier threat model in `/evidence/verification-scope.json`:

```json
{
  "verification_mode": "local_reproducibility",
  "authenticated": false,
  "signature_required": false,
  "claims": [
    "inputs match hashes",
    "outputs reproduce hashes",
    "projection constraints pass"
  ],
  "does_not_claim": [
    "human authorship",
    "external authority",
    "semantic truth",
    "permanent availability"
  ]
}
```

This model declares exactly what the stand-alone verifier witnesses versus what it remains agnostic towards:
- **It CLAIMS**: Bounded, deterministic reproducibility of outputs from a known set of inputs under a defined compiler identity.
- **It DOES NOT CLAIM**: Authentic human origin, external oracle agreement, objective semantic correctness of the statements, or physical data retention.

---

## 🌀 Future Abstraction: Nested Execution Domains

In future layers, the Jubilee architecture expands to support **nested execution domains**. 

Instead of building larger, more centralized certificates, VMs can consume other VMs' receipts as inputs:

```
Outer VM
 ├── policy
 ├── compiler
 ├── receipt verifier
 │
 └── Inner VM
      ├── claims
      ├── policy
      ├── execution DAG
      └── stability certificate
```

Crucially, **the outer VM never absorbs the inner VM's authority.** It simply witnesses:
> `inner_receipt`: *"this bounded transformation occurred under these conditions"*

This preserves the core invariant: **A VM may witness another VM. It may not become the source of that VM's meaning.** Jubilee stops being merely a topology compiler and becomes a general provenance-preserving runtime environment.

---

## 🚀 5-Invariant Release Gates (Automated Test Suite)

To ensure maximum structural stability before compilation and deployment, the suite enforces 5 critical release invariants:

1. **`test_verifier_is_non_mutating`**: Verifies that invoking the Standalone Verifier on a receipt does not mutate any claims, policy, or compiler configuration.
2. **`test_receipt_replay_is_deterministic`**: Confirms that compiling the same raw claim manifest twice yields bit-for-bit identical receipt IDs.
3. **`test_compiler_drift_changes_receipt`**: Ensures that modifying even a single sub-field of the `CompilerIdentity` (such as `adapter_map_hash`) forces a complete mismatch, preventing masquerading.
4. **`test_missing_parent_fails_verification`**: Ensures that references to parent receipts are caught and rejected as `MISSING_PARENT` if those parents are not supplied.
5. **`test_projected_edge_retains_canonical_ancestry`**: Guarantees that every edge in a projected DAG contains a valid lineage (`derived_from`) mapping directly to an original canonical edge ID.

---

## 🛠️ Running & Compiling the Sandbox

The app is built using **React 19**, **Vite 6**, and **Tailwind CSS**.

### Installation
```bash
# Install package dependencies
npm install
```

### Run Development Server
```bash
# Starts local playground on port 3000
npm run dev
```

### Build & Lint
```bash
# Verify type emissions and compilation
npm run lint
npm run build
```

---

*Jubilee is a formal workspace representation. Play, trace, and verify with sovereign safety.*
