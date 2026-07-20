import { 
  EdgeRecord, 
  PolicyArtifact, 
  CompilerIdentity, 
  JubileeCompiler, 
  hashClaims, 
  hashPolicy, 
  hashCompiler, 
  hashGraph,
  EdgeFamily, 
  EpistemicStatus,
  InterpretationStatus,
  ProjectionKind,
  project,
  evaluate_compilation_activity,
  build_multigraph_from_records,
  MultiDiGraph,
  isDirectedAcyclicGraph
} from "./jubilee";
import { verifyReceiptStandalone } from "./verifyReceipts";

export interface TestResult {
  name: string;
  suite: string;
  status: "PASSED" | "FAILED";
  error?: string;
  logs: string[];
}

export function runVMTestSuite(): TestResult[] {
  const results: TestResult[] = [];
  const suiteName = "tests/test_compilation_lifecycle.py";

  // Shared immutable mock elements
  const claimManifest1: EdgeRecord[] = [
    {
      edge_id: "claim_001",
      source: "G1_ANCHOR",
      target: "NS_DryLand",
      family: EdgeFamily.DEPENDS_ON,
      rationale: "Day 3 dry land emerged inside Genesis framework",
      epistemic_status: EpistemicStatus.OBSERVED,
      interpretation_status: InterpretationStatus.CANONICAL,
      confidence: 1.0,
      source_path: "sources/genesis_1.txt",
      source_hash: "sha256_mock_g1_hash",
      declared_by: "steward_moses",
      policy_version: "v3.2.8",
      policy_hash: "sha256_mock_policy_hash_v3_2_8",
      derived_from: []
    }
  ];

  const claimManifest2: EdgeRecord[] = [
    {
      edge_id: "claim_002",
      source: "J_logos_anchor",
      target: "G1_ANCHOR",
      family: EdgeFamily.IMPORTS,
      rationale: "John 1:1 'en arche' imports Genesis arche",
      epistemic_status: EpistemicStatus.INTERPRETIVE,
      interpretation_status: InterpretationStatus.SPECULATIVE,
      confidence: 0.95,
      source_path: "sources/john_1.txt",
      source_hash: "sha256_mock_j1_hash",
      declared_by: "steward_john",
      policy_version: "v3.2.8",
      policy_hash: "sha256_mock_policy_hash_v3_2_8",
      derived_from: ["claim_001"]
    }
  ];

  const policy: PolicyArtifact = {
    policy_version: "v3.2.8",
    allowed_families: [EdgeFamily.DEPENDS_ON, EdgeFamily.IMPORTS, EdgeFamily.POPULATES, EdgeFamily.SCOPE_MIRRORS],
    restricted_scopes: ["NS_Sabbath_Cycle"],
    required_confidence_threshold: 0.8
  };

  const compiler: CompilerIdentity = {
    compiler_name: "JubileeCoreCompiler",
    compiler_version: "v3.2.4-reproducibility",
    compiler_hash: "sha256_v3_2_4_compiler_core_hash_val",
    policy_engine_hash: "sha256_v3_2_4_policy_engine_hash_val",
    schema_hash: "sha256_v3_2_4_schema_hash_val",
    adapter_map_version: "v1.0.2",
    adapter_map_hash: "sha256_v3_2_4_adapter_map_hash_val"
  };

  // --- 10-Step Compilation Vertical Slice Test ---
  {
    const logs: string[] = [];
    logs.push("$ pytest -v tests/test_compilation_lifecycle.py");
    logs.push("======================== test_prov_compilation_lifecycle starts ========================");

    try {
      const compiler_instance = new JubileeCompiler();

      // Step 1: Load two immutable claim manifests
      logs.push("Step 1: Loading claim manifest 1 and manifest 2...");
      const combinedClaims = [...claimManifest1, ...claimManifest2];
      logs.push(`Loaded ${combinedClaims.length} total edge records: ${combinedClaims.map(c => c.edge_id).join(", ")}`);

      // Step 2: Canonically hash the claims
      logs.push("Step 2: Performing canonical claim serialization & hashing...");
      const policy_hash = hashPolicy(policy);
      const claims_hash = hashClaims(combinedClaims, policy_hash);
      logs.push(`[claims_hash] = ${claims_hash}`);

      // Step 3: Load a versioned policy artifact and hash it
      logs.push("Step 3: Loading versioned policy 'v3.2.8'...");
      logs.push(`[policy_hash] = ${policy_hash}`);

      // Step 4: Compile using compiler identity/hash
      logs.push("Step 4: Compiling claims under the designated policy...");
      const compileResult = compiler_instance.compile(combinedClaims, policy, compiler);
      logs.push(`[activity_id] = ${compileResult.activity.activity_id}`);

      // Step 5: Emit canonical and projection artifacts
      logs.push("Step 5: Emitting compiled graph with nodes & edges...");
      const outputGraph = compileResult.graph;
      const canonical_graph_hash = hashGraph(outputGraph);
      logs.push(`Nodes compiled: ${outputGraph.nodes.join(", ")}`);
      logs.push(`Edges compiled: ${outputGraph.edges.map(e => e.edge_id).join(", ")}`);
      logs.push(`[canonical_graph_hash] = ${canonical_graph_hash}`);

      // Step 6: Emit a receipt with parent receipt references
      logs.push("Step 6: Writing receipt with non-temporal metrics...");
      const receipt = compileResult.receipt;
      logs.push(`[receipt_id] = ${receipt.receipt_id}`);
      logs.push(`[claims_hash_in_receipt] = ${receipt.claims_hash}`);

      // Step 7: Recompile in a fresh process / compiler instance
      logs.push("Step 7: Bootstrapping fresh compiler instance for reproduction check...");
      const freshCompiler = new JubileeCompiler();
      const freshCompileResult = freshCompiler.compile(combinedClaims, policy, compiler);
      logs.push(`[fresh_activity_id] = ${freshCompileResult.activity.activity_id}`);

      // Step 8: Verify every non-temporal hash matches
      logs.push("Step 8: Verifying non-temporal hashes for exact equivalence...");
      const fresh_claims_hash = hashClaims(combinedClaims, policy_hash);
      const fresh_policy_hash = hashPolicy(policy);
      const fresh_graph_hash = hashGraph(freshCompileResult.graph);

      const claimsMatch = claims_hash === fresh_claims_hash;
      const policiesMatch = policy_hash === fresh_policy_hash;
      const graphsMatch = canonical_graph_hash === fresh_graph_hash;

      logs.push(`> claims_hash match: ${claimsMatch} (expected true)`);
      logs.push(`> policy_hash match: ${policiesMatch} (expected true)`);
      logs.push(`> canonical_graph_hash match: ${graphsMatch} (expected true)`);

      if (!claimsMatch || !policiesMatch || !graphsMatch) {
        throw new Error("Deterministic hash replication failed! Output varies across fresh processes.");
      }

      // Step 9: Change one rationale or one policy rule
      logs.push("Step 9: Modifying one claim rationale to simulate dynamic change...");
      const mutatedClaims = [
        ...claimManifest1,
        {
          ...claimManifest2[0],
          rationale: "Altered explanation to trigger mismatch"
        }
      ];

      // Step 10: Assert the affected hash and receipt identity change
      logs.push("Step 10: Compiling mutated claims, asserting affected hashes change...");
      const mutatedCompileResult = freshCompiler.compile(mutatedClaims, policy, compiler);
      const mutated_claims_hash = hashClaims(mutatedClaims, policy_hash);

      const claimsChanged = claims_hash !== mutated_claims_hash;
      const receiptIDChanged = receipt.receipt_id !== mutatedCompileResult.receipt.receipt_id;

      logs.push(`> claims_hash changed successfully: ${claimsChanged} (expected true)`);
      logs.push(`> receipt_id changed successfully: ${receiptIDChanged} (expected true)`);

      if (!claimsChanged || !receiptIDChanged) {
        throw new Error("Tampering went undetected! Altered rationale did not affect output hashes.");
      }

      logs.push("========================== Lifecycle verification completed. ==========================");

      results.push({
        name: "test_compilation_lifecycle_10_steps",
        suite: suiteName,
        status: "PASSED",
        logs
      });

    } catch (e: any) {
      logs.push(`[error] FAILED: ${e.message || String(e)}`);
      results.push({
        name: "test_compilation_lifecycle_10_steps",
        suite: suiteName,
        status: "FAILED",
        error: e.message || String(e),
        logs
      });
    }
  }

  // --- Suite test_policy_binding_violation ---
  {
    const suiteName_pb = "tests/test_policy_binding.py";
    const logs: string[] = ["$ pytest -v tests/test_policy_binding.py"];
    try {
      const compiler_instance = new JubileeCompiler();
      const conflictingClaim: EdgeRecord = {
        edge_id: "claim_003",
        source: "G1_ANCHOR",
        target: "NS_DryLand",
        family: EdgeFamily.DEPENDS_ON,
        rationale: "Mismatching policy declaration",
        epistemic_status: EpistemicStatus.OBSERVED,
        interpretation_status: InterpretationStatus.CANONICAL,
        confidence: 1.0,
        source_path: "sources/genesis_1.txt",
        source_hash: "sha256_mock_hash",
        declared_by: "moses",
        policy_version: "v9.9.9", // Policy version mismatch with compiler activity
        derived_from: []
      };

      logs.push("Attempting to compile claim with conflicting policy version ('v9.9.9' vs 'v3.2.8')...");
      const result = compiler_instance.compile([conflictingClaim], policy, compiler);
      logs.push(`Validation passed: ${result.receipt.validation_passed}`);
      logs.push(`Validation errors recorded: ${result.receipt.validation_errors.join(", ")}`);

      if (!result.receipt.validation_passed && result.receipt.validation_errors.some(e => e.includes("declares policy"))) {
        results.push({
          name: "test_policy_binding_violation_caught",
          suite: suiteName_pb,
          status: "PASSED",
          logs
        });
      } else {
        throw new Error("Conflicting policy binding went unflagged!");
      }
    } catch (e: any) {
      results.push({
        name: "test_policy_binding_violation_caught",
        suite: suiteName_pb,
        status: "FAILED",
        error: e.message || String(e),
        logs
      });
    }
  }

  // --- Suite test_confidence_threshold_violation ---
  {
    const suiteName_ct = "tests/test_threshold.py";
    const logs: string[] = ["$ pytest -v tests/test_threshold.py"];
    try {
      const compiler_instance = new JubileeCompiler();
      const lowConfidenceClaim: EdgeRecord = {
        edge_id: "claim_004",
        source: "G1_ANCHOR",
        target: "NS_DryLand",
        family: EdgeFamily.DEPENDS_ON,
        rationale: "Uncertain claim below policy threshold",
        epistemic_status: EpistemicStatus.OBSERVED,
        interpretation_status: InterpretationStatus.CANONICAL,
        confidence: 0.5, // 0.5 is lower than 0.8 policy threshold
        source_path: "sources/genesis_1.txt",
        source_hash: "sha256_mock_hash",
        declared_by: "moses",
        policy_version: "v3.2.8",
        derived_from: []
      };

      logs.push("Attempting to compile claim with low confidence (0.5 vs threshold 0.8)...");
      const result = compiler_instance.compile([lowConfidenceClaim], policy, compiler);
      logs.push(`Validation passed: ${result.receipt.validation_passed}`);
      logs.push(`Validation errors recorded: ${result.receipt.validation_errors.join(", ")}`);

      if (!result.receipt.validation_passed && result.receipt.validation_errors.some(e => e.includes("below the policy threshold"))) {
        results.push({
          name: "test_confidence_threshold_violation_caught",
          suite: suiteName_ct,
          status: "PASSED",
          logs
        });
      } else {
        throw new Error("Confidence threshold breach went unflagged!");
      }
    } catch (e: any) {
      results.push({
        name: "test_confidence_threshold_violation_caught",
        suite: suiteName_ct,
        status: "FAILED",
        error: e.message || String(e),
        logs
      });
    }
  }

  // --- Suite test_steward_pipeline (Isolated Target Proof Suite) ---
  {
    const suiteName_sp = "tests/test_steward_pipeline.py";
    const logs: string[] = ["$ pytest -v tests/test_steward_pipeline.py"];
    try {
      logs.push("Running test_reception_relations_cannot_cycle_execution...");
      
      const john_reception_graph = new MultiDiGraph();
      const meta = {
        rationale: "Grounded execution constraint test case",
        interpretation_status: InterpretationStatus.CANONICAL,
        source_path: "src/john_linker.py",
        source_hash: "e12a44",
        declared_by: "Lu V",
        policy_version: "v3.2.3",
        policy_hash: "88fa12b",
        confidence: 1.0,
        derived_from: []
      };

      // Valid Execution Edge
      john_reception_graph.addEdge(
        "TrueLight", "Reveal", "j01", 
        { family: EdgeFamily.DEPENDS_ON, edge_id: "j01", ...meta }
      );

      // Reciprocal Realization State Elements (Opposing Directional Channels)
      john_reception_graph.addEdge(
        "TrueLight", "WorldReject", "j02", 
        { family: EdgeFamily.ENCOUNTERS, edge_id: "j02", ...meta }
      );
      john_reception_graph.addEdge(
        "WorldReject", "TrueLight", "j03", 
        { family: EdgeFamily.REJECTS, edge_id: "j03", ...meta }
      );

      // Project execution and realization
      const execution = project(john_reception_graph, ProjectionKind.EXECUTION);
      const realization = project(john_reception_graph, ProjectionKind.REALIZATION);

      const execDag = isDirectedAcyclicGraph(execution);
      const realDag = isDirectedAcyclicGraph(realization);

      logs.push(`> Execution is DAG: ${execDag.isDag} (expected true)`);
      logs.push(`> Realization is DAG: ${realDag.isDag} (expected false)`);

      if (!execDag.isDag) {
        throw new Error("Scheduler sequence contaminated by narrative loops!");
      }
      if (realDag.isDag) {
        throw new Error("Realization projection failed to retain reciprocal states!");
      }

      logs.push("Running test_reproducible_receipt_stewardship...");
      const source_checksums = { "john_linker.py": "e12a44" };
      const { receipt, breakdown } = evaluate_compilation_activity(
        john_reception_graph, source_checksums, "v3.2.3", "88fa12b"
      );

      logs.push(`> receipt.validation_passed: ${receipt.validation_passed} (expected true)`);
      logs.push(`> receipt.feedback_scc_count: ${receipt.feedback_scc_count} (expected 1)`);
      logs.push(`> 'execution' in projection_hashes: ${"execution" in receipt.projection_hashes} (expected true)`);

      if (!receipt.validation_passed || receipt.feedback_scc_count !== 1 || !("execution" in receipt.projection_hashes)) {
        throw new Error("Receipt stewardship validation failed!");
      }

      logs.push(`[PIPELINE OUTPUT] Attributed Realization Loops Detected: ${receipt.feedback_scc_count}`);
      logs.push("========================== Steward pipeline verification completed. ==========================");

      results.push({
        name: "test_steward_pipeline_regression",
        suite: suiteName_sp,
        status: "PASSED",
        logs
      });

    } catch (e: any) {
      logs.push(`[error] FAILED: ${e.message || String(e)}`);
      results.push({
        name: "test_steward_pipeline_regression",
        suite: suiteName_sp,
        status: "FAILED",
        error: e.message || String(e),
        logs
      });
    }
  }

  // --- Suite test_receipt_verifier_standalone (Standalone Verifier Proof) ---
  {
    const suiteName_rv = "tests/test_verify_receipts.py";
    const logs: string[] = ["$ python -m jubilee.verify_receipts test_receipt.json"];
    try {
      logs.push("Setting up a valid compilation and testing standalone receipt verifier...");
      const compiler_instance = new JubileeCompiler();
      const claims = [...claimManifest1, ...claimManifest2];
      const compileResult = compiler_instance.compile(claims, policy, compiler);
      const originalReceipt = compileResult.receipt;

      // Case 1: Test valid verification
      logs.push("Case 1: Verifying a perfectly valid, reproducible receipt...");
      const resultValid = verifyReceiptStandalone(originalReceipt, {
        filename: `${originalReceipt.receipt_id.replace("sha256:", "")}.json`,
        claims,
        policy,
        compiler
      });
      logs.push(`Status: ${resultValid.status}`);
      logs.push(`Conclusion: ${resultValid.conclusion}`);
      if (resultValid.status !== "VALID") {
        throw new Error(`Expected VALID but got ${resultValid.status}`);
      }

      // Case 2: Test malformed (missing fields)
      logs.push("Case 2: Verifying a malformed receipt (missing claims_hash)...");
      const malformedReceipt = { ...originalReceipt };
      delete (malformedReceipt as any).claims_hash;
      const resultMalformed = verifyReceiptStandalone(malformedReceipt, {
        filename: `${originalReceipt.receipt_id.replace("sha256:", "")}.json`,
        claims,
        policy,
        compiler
      });
      logs.push(`Status: ${resultMalformed.status}`);
      if (resultMalformed.status !== "MALFORMED") {
        throw new Error(`Expected MALFORMED but got ${resultMalformed.status}`);
      }

      // Case 3: Test mismatch (policy changed)
      logs.push("Case 3: Verifying when policy has been altered...");
      const alteredPolicy: PolicyArtifact = {
        ...policy,
        required_confidence_threshold: 0.1 // altered from 0.8
      };
      const resultMismatch = verifyReceiptStandalone(originalReceipt, {
        filename: `${originalReceipt.receipt_id.replace("sha256:", "")}.json`,
        claims,
        policy: alteredPolicy,
        compiler
      });
      logs.push(`Status: ${resultMismatch.status}`);
      if (resultMismatch.status !== "MISMATCH") {
        throw new Error(`Expected MISMATCH but got ${resultMismatch.status}`);
      }

      // Case 4: Test unreproducible (claims changed)
      logs.push("Case 4: Verifying when claims are altered...");
      const alteredClaims = [
        ...claimManifest1,
        { ...claimManifest2[0], rationale: "Altered explanation" }
      ];
      const resultUnreproducible = verifyReceiptStandalone(originalReceipt, {
        filename: `${originalReceipt.receipt_id.replace("sha256:", "")}.json`,
        claims: alteredClaims,
        policy,
        compiler
      });
      logs.push(`Status: ${resultUnreproducible.status}`);
      if (resultUnreproducible.status !== "UNREPRODUCIBLE") {
        throw new Error(`Expected UNREPRODUCIBLE but got ${resultUnreproducible.status}`);
      }

      // Case 5: Test missing parent
      logs.push("Case 5: Verifying receipt with missing parent reference...");
      const receiptWithParent = {
        ...originalReceipt,
        parent_receipts: ["sha256_non_existent_parent"]
      };
      const resultMissingParent = verifyReceiptStandalone(receiptWithParent, {
        filename: `${originalReceipt.receipt_id.replace("sha256:", "")}.json`,
        claims,
        policy,
        compiler,
        availableReceipts: {} // none supplied
      });
      logs.push(`Status: ${resultMissingParent.status}`);
      if (resultMissingParent.status !== "MISSING_PARENT") {
        throw new Error(`Expected MISSING_PARENT but got ${resultMissingParent.status}`);
      }

      logs.push("All standalone verifier cases successfully checked!");
      results.push({
        name: "test_receipt_verifier_standalone_scenarios",
        suite: suiteName_rv,
        status: "PASSED",
        logs
      });

    } catch (e: any) {
      logs.push(`[error] FAILED: ${e.message || String(e)}`);
      results.push({
        name: "test_receipt_verifier_standalone_scenarios",
        suite: suiteName_rv,
        status: "FAILED",
        error: e.message || String(e),
        logs
      });
    }
  }

  // --- Suite test_five_invariant_release_gates (Security & Reproducibility Guarantees) ---
  {
    const suiteName_ig = "tests/test_five_invariant_release_gates.py";
    const logs: string[] = ["$ pytest -v tests/test_five_invariant_release_gates.py"];
    try {
      logs.push("Running the five invariant release gates tests...");
      const compiler_instance = new JubileeCompiler();
      const claims = [...claimManifest1, ...claimManifest2];

      // 1. test_verifier_is_non_mutating
      logs.push("Running: test_verifier_is_non_mutating...");
      const compileResult = compiler_instance.compile(claims, policy, compiler);
      const receipt = compileResult.receipt;
      const before_snapshot = JSON.stringify({ receipt, claims, policy, compiler });
      verifyReceiptStandalone(receipt, { claims, policy, compiler });
      const after_snapshot = JSON.stringify({ receipt, claims, policy, compiler });
      if (before_snapshot !== after_snapshot) {
        throw new Error("Mutation detected inside verifier context!");
      }
      logs.push("  [OK] test_verifier_is_non_mutating passed: context remains immutable.");

      // 2. test_receipt_replay_is_deterministic
      logs.push("Running: test_receipt_replay_is_deterministic...");
      const receipt_a = compiler_instance.compile(claims, policy, compiler).receipt;
      const receipt_b = compiler_instance.compile(claims, policy, compiler).receipt;
      if (receipt_a.receipt_id !== receipt_b.receipt_id) {
        throw new Error(`Receipt id nondeterminism detected! ${receipt_a.receipt_id} vs ${receipt_b.receipt_id}`);
      }
      logs.push("  [OK] test_receipt_replay_is_deterministic passed: receipts match perfectly.");

      // 3. test_compiler_drift_changes_receipt
      logs.push("Running: test_compiler_drift_changes_receipt...");
      const compiler_drifted: CompilerIdentity = {
        ...compiler,
        adapter_map_hash: "sha256_drifted_adapter_map_hash"
      };
      const original = compiler_instance.compile(claims, policy, compiler).receipt;
      const changed = compiler_instance.compile(claims, policy, compiler_drifted).receipt;
      if (original.receipt_id === changed.receipt_id) {
        throw new Error("Receipt ID failed to change upon compiler drift!");
      }
      logs.push("  [OK] test_compiler_drift_changes_receipt passed: drift detected instantly.");

      // 4. test_missing_parent_fails_verification
      logs.push("Running: test_missing_parent_fails_verification...");
      const receipt_with_parent = {
        ...original,
        parent_receipts: ["sha256_non_existent_parent_id"]
      };
      const missing_parent_result = verifyReceiptStandalone(receipt_with_parent, {
        claims,
        policy,
        compiler,
        availableReceipts: {} // no parents supplied
      });
      if (missing_parent_result.status !== "MISSING_PARENT") {
        throw new Error(`Expected MISSING_PARENT status but got: ${missing_parent_result.status}`);
      }
      logs.push("  [OK] test_missing_parent_fails_verification passed: caught unresolved reference.");

      // 5. test_projected_edge_retains_canonical_ancestry
      logs.push("Running: test_projected_edge_retains_canonical_ancestry...");
      const canonical_edge_ids = new Set(claims.map(c => c.edge_id));
      const mGraph = build_multigraph_from_records(claims);
      const execution_projection = project(mGraph, ProjectionKind.EXECUTION);
      for (const edge of execution_projection.edges) {
        const derived_from_field = edge.data["derived_from"];
        if (Array.isArray(derived_from_field)) {
          derived_from_field.forEach(derivedId => {
            if (!canonical_edge_ids.has(derivedId)) {
              throw new Error(`Leaked ancestor edge found in projection: ${derivedId}`);
            }
          });
        } else if (typeof derived_from_field === "string") {
          if (!canonical_edge_ids.has(derived_from_field)) {
            throw new Error(`Leaked ancestor edge found in projection: ${derived_from_field}`);
          }
        }
      }
      logs.push("  [OK] test_projected_edge_retains_canonical_ancestry passed: ancestry verified.");

      logs.push("All 5 release gates passed successfully!");
      results.push({
        name: "test_five_invariant_release_gates",
        suite: suiteName_ig,
        status: "PASSED",
        logs
      });

    } catch (e: any) {
      logs.push(`[error] FAILED: ${e.message || String(e)}`);
      results.push({
        name: "test_five_invariant_release_gates",
        suite: suiteName_ig,
        status: "FAILED",
        error: e.message || String(e),
        logs
      });
    }
  }

  return results;
}
