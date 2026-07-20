import React, { useState, useEffect } from "react";
import { 
  EdgeRecord, 
  PolicyArtifact, 
  CompilerIdentity, 
  JubileeCompiler, 
  EdgeFamily, 
  EpistemicStatus,
  InterpretationStatus,
  ProjectionKind,
  FeedbackKind,
  hashClaims,
  hashPolicy,
  hashCompiler,
  hashGraph,
  TopologyReceipt,
  CanonicalGraph,
  MultiDiGraph,
  build_multigraph_from_records,
  project,
  isDirectedAcyclicGraph,
  getStronglyConnectedComponents,
  classifyFeedbackScc
} from "../lib/jubilee";
import { runVMTestSuite, TestResult } from "../lib/testRunner";
import { verifyReceiptStandalone } from "../lib/verifyReceipts";
import { 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  PlusCircle, 
  CheckCircle2, 
  History, 
  Database, 
  Cpu, 
  Settings, 
  Terminal, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  GitMerge,
  Layers,
  ArrowRight
} from "lucide-react";

export function VMPlayground() {
  const [compiler] = useState(() => new JubileeCompiler());

  // Default Claim Manifest representing PROV entities (with updated relations)
  const [claims, setClaims] = useState<EdgeRecord[]>([
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
      derived_from: []
    },
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
      derived_from: ["claim_001"]
    },
    {
      edge_id: "claim_003",
      source: "TrueLight",
      target: "WorldReject",
      family: EdgeFamily.ENCOUNTERS,
      rationale: "The Light encounters the world in history",
      epistemic_status: EpistemicStatus.OBSERVED,
      interpretation_status: InterpretationStatus.CANONICAL,
      confidence: 1.0,
      source_path: "sources/john_1.txt",
      source_hash: "sha256_mock_j1_hash",
      declared_by: "steward_john",
      policy_version: "v3.2.8",
      derived_from: []
    },
    {
      edge_id: "claim_004",
      source: "WorldReject",
      target: "TrueLight",
      family: EdgeFamily.REJECTS,
      rationale: "Reciprocal narrative loop: the world rejected Him",
      epistemic_status: EpistemicStatus.DERIVED,
      interpretation_status: InterpretationStatus.DERIVED,
      confidence: 0.9,
      source_path: "sources/john_1.txt",
      source_hash: "sha256_mock_j1_hash",
      declared_by: "steward_john",
      policy_version: "v3.2.8",
      derived_from: ["claim_003"]
    }
  ]);

  // Current Policy Artifact
  const [policy, setPolicy] = useState<PolicyArtifact>({
    policy_version: "v3.2.8",
    allowed_families: [
      EdgeFamily.DEPENDS_ON, 
      EdgeFamily.IMPORTS, 
      EdgeFamily.POPULATES, 
      EdgeFamily.SCOPE_MIRRORS,
      EdgeFamily.ENCOUNTERS,
      EdgeFamily.REJECTS,
      EdgeFamily.RECEIVES,
      EdgeFamily.GRANTS
    ],
    restricted_scopes: ["NS_Sabbath_Cycle"],
    required_confidence_threshold: 0.8
  });

  // Current Compiler Identity
  const [compilerIdentity] = useState<CompilerIdentity>({
    compiler_name: "JubileeCoreCompiler",
    compiler_version: "v3.2.4-reproducibility",
    compiler_hash: "sha256_v3_2_4_compiler_core_hash_val",
    policy_engine_hash: "sha256_v3_2_4_policy_engine_hash_val",
    schema_hash: "sha256_v3_2_4_schema_hash_val",
    adapter_map_version: "v1.0.2",
    adapter_map_hash: "sha256_v3_2_4_adapter_map_hash_val"
  });

  // Active compilation outputs
  const [compiledGraph, setCompiledGraph] = useState<CanonicalGraph | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<TopologyReceipt | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [standaloneVerifierResult, setStandaloneVerifierResult] = useState<any | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Projection Viewer states
  const [selectedProjection, setSelectedProjection] = useState<ProjectionKind | "canonical">("canonical");

  // Custom new claim form states
  const [newId, setNewId] = useState("");
  const [newSource, setNewSource] = useState("TrueLight");
  const [newTarget, setNewTarget] = useState("Reveal");
  const [newFamily, setNewFamily] = useState<EdgeFamily>(EdgeFamily.DEPENDS_ON);
  const [newRationale, setNewRationale] = useState("");
  const [newStatus, setNewStatus] = useState<EpistemicStatus>(EpistemicStatus.OBSERVED);
  const [newConfidence, setNewConfidence] = useState(1.0);
  const [newPolicyVersion, setNewPolicyVersion] = useState("v3.2.8");
  const [newDeclaredBy, setNewDeclaredBy] = useState("steward_john");

  // Terminal pytest log runner state
  const [pytestLogs, setPytestLogs] = useState<string[]>([]);
  const [pytestStatus, setPytestStatus] = useState<"IDLE" | "RUNNING" | "PASSED" | "FAILED">("IDLE");

  // Alert updates
  const [alert, setAlert] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Trigger compiler execution
  const executeCompilation = (currentClaims = claims, currentPolicy = policy) => {
    try {
      const result = compiler.compile(currentClaims, currentPolicy, compilerIdentity);
      setCompiledGraph(result.graph);
      setActiveReceipt(result.receipt);
      setValidationErrors(result.receipt.validation_errors);
      
      // Clear previous verification state
      setVerificationResult(null);
      setStandaloneVerifierResult(null);

      if (result.receipt.validation_passed) {
        setAlert({
          text: `Compilation complete. Receipt ${result.receipt.receipt_id} generated. Realization loop feedback identified cleanly.`,
          type: "success"
        });
      } else {
        setAlert({
          text: `Compilation completed with warning: ${result.receipt.validation_errors.length} validation/DAG cycle errors detected.`,
          type: "error"
        });
      }
    } catch (err: any) {
      setAlert({
        text: `Compiler crash: ${err.message || String(err)}`,
        type: "error"
      });
    }
  };

  // Compile on initial mount
  useEffect(() => {
    executeCompilation();
  }, []);

  // Handle adding custom claim
  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newId.trim() || `claim_${Math.random().toString(36).substring(2, 7)}`;
    
    if (claims.some(c => c.edge_id === id)) {
      setAlert({ text: `Duplicate Claim ID: ${id} already exists.`, type: "error" });
      return;
    }

    const interpretation_status = newStatus === EpistemicStatus.OBSERVED ? InterpretationStatus.CANONICAL :
                                 newStatus === EpistemicStatus.DERIVED ? InterpretationStatus.DERIVED :
                                 InterpretationStatus.SPECULATIVE;

    const newClaim: EdgeRecord = {
      edge_id: id,
      source: newSource.trim(),
      target: newTarget.trim(),
      family: newFamily,
      rationale: newRationale.trim() || "User provided provenance",
      epistemic_status: newStatus,
      interpretation_status,
      confidence: Number(newConfidence),
      source_path: "src/john_linker.py",
      source_hash: "e12a44",
      declared_by: newDeclaredBy.trim() || "steward_user",
      policy_version: newPolicyVersion.trim() || policy.policy_version,
      derived_from: []
    };

    const updatedClaims = [...claims, newClaim];
    setClaims(updatedClaims);
    setNewId("");
    setNewRationale("");
    setAlert({ text: `Claim '${id}' successfully declared. Recompiling manifest...`, type: "info" });
    
    executeCompilation(updatedClaims);
  };

  // Remove claim from manifest
  const handleRemoveClaim = (id: string) => {
    const updated = claims.filter(c => c.edge_id !== id);
    setClaims(updated);
    setAlert({ text: `Claim '${id}' removed from active manifest.`, type: "info" });
    executeCompilation(updated);
  };

  // Verify compilation receipt
  const verifyReceipt = () => {
    if (!activeReceipt) return;
    const result = compiler.verify_compilation_receipt(activeReceipt, claims, policy, compilerIdentity);
    setVerificationResult(result);
    if (result.overall_valid) {
      setAlert({
        text: "Deterministic replay validation: SUCCESS. Manifest, policy, and compiled artifact hashes match receipt.",
        type: "success"
      });
    } else {
      setAlert({
        text: "Deterministic replay validation: FAILED! Mismatch or unmet DAG constraints detected.",
        type: "error"
      });
    }
  };

  // Simulate Tampering Attack
  const triggerTamperAttack = () => {
    if (!activeReceipt) return;
    const tamperedClaims = claims.map((c, i) => i === 0 ? { ...c, rationale: "FORGED EVIDENCE DETAIL" } : c);
    
    const result = compiler.verify_compilation_receipt(activeReceipt, tamperedClaims, policy, compilerIdentity);
    setVerificationResult(result);
    setStandaloneVerifierResult(null); // Clear standalone results on tamper
    
    setAlert({
      text: "Tamper simulation triggered! Verification engine caught claims_hash mismatch instantly.",
      type: "error"
    });
  };

  // Standalone Receipt Verifier Execution
  const executeStandaloneVerifier = () => {
    if (!activeReceipt) return;
    const result = verifyReceiptStandalone(activeReceipt, {
      filename: `${activeReceipt.receipt_id.replace("sha256:", "")}.json`,
      claims,
      policy,
      compiler: compilerIdentity
    });
    setStandaloneVerifierResult(result);
    setAlert({
      text: `Standalone verifier run completed: ${result.status}. ${result.conclusion}`,
      type: result.status === "VALID" ? "success" : "error"
    });
  };

  // Run the 10-Step lifecycle Pytest Runner from testRunner
  const executePytestRunner = () => {
    setPytestStatus("RUNNING");
    setPytestLogs(["$ pytest --verbose tests/test_steward_pipeline.py"]);
    
    setTimeout(() => {
      setPytestLogs(prev => [
        ...prev,
        "============================= pytest session starts ==============================",
        "platform linux -- Python 3.11.2, pytest-7.2.1 -- /usr/bin/python3",
        "rootdir: /workspace, configfile: pytest.ini",
        "collected 4 items",
        ""
      ]);
    }, 300);

    setTimeout(() => {
      const suiteResults = runVMTestSuite();
      
      const lifecycleTest = suiteResults.find(r => r.name === "test_compilation_lifecycle_10_steps");
      const pipelineTest = suiteResults.find(r => r.name === "test_steward_pipeline_regression");
      
      if (pipelineTest && lifecycleTest) {
        setPytestLogs(prev => [
          ...prev,
          ...lifecycleTest.logs.filter(l => !l.startsWith("$") && !l.startsWith("===")),
          "",
          "--------------------------------------------------------------------------------",
          ...pipelineTest.logs.filter(l => !l.startsWith("$") && !l.startsWith("==="))
        ]);
        setPytestStatus(pipelineTest.status === "PASSED" && lifecycleTest.status === "PASSED" ? "PASSED" : "FAILED");
      } else {
        setPytestLogs(prev => [...prev, "ERROR: Test suite execution failed to return regression results."]);
        setPytestStatus("FAILED");
      }
    }, 1000);
  };

  // Compute projected sub-graph for display
  const getProjectedGraphEdges = () => {
    if (selectedProjection === "canonical") {
      return compiledGraph?.edges || [];
    }
    const mGraph = build_multigraph_from_records(claims);
    try {
      const projected = project(mGraph, selectedProjection);
      return projected.edges.map(e => ({
        edge_id: e.key,
        source: e.source,
        target: e.target,
        family: e.data.family as EdgeFamily,
        claims_source: "projected"
      }));
    } catch {
      return [];
    }
  };

  const projectedEdges = getProjectedGraphEdges();

  // Run cycle / SCC analysis on projected graph
  const getProjectedGraphAnalysis = () => {
    const mGraph = build_multigraph_from_records(claims);
    let view = mGraph;
    if (selectedProjection !== "canonical") {
      try {
        view = project(mGraph, selectedProjection);
      } catch {
        return { isDag: true, sccs: [] };
      }
    }
    const dagCheck = isDirectedAcyclicGraph(view);
    const sccs = getStronglyConnectedComponents(view);
    return { isDag: dagCheck.isDag, sccs };
  };

  const { isDag: isProjectedDag, sccs: projectedSccs } = getProjectedGraphAnalysis();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Manifest Editor & Policies */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        
        {/* Claims Manifest editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-100 flex items-center gap-2 text-base">
                <Database className="text-emerald-500 w-5 h-5" />
                Declared Claims Manifest
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                The absolute authority source. Edit or declare new immutable entities with rationales.
              </p>
            </div>
            <button
              onClick={() => executeCompilation()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recompile
            </button>
          </div>

          {/* Table of Claims */}
          <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 terminal-scroll mb-4">
            {claims.map((claim) => {
              const isViolatingPolicy = activeReceipt && activeReceipt.validation_errors.some(err => err.includes(claim.edge_id));
              return (
                <div 
                  key={claim.edge_id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isViolatingPolicy
                      ? "bg-rose-950/20 border-rose-500/50 text-rose-200"
                      : "bg-slate-950/50 border-slate-800 text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-emerald-400 font-bold">{claim.edge_id}</span>
                      <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-400 uppercase border border-slate-800">
                        {claim.family}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveClaim(claim.edge_id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      title="Delete Claim"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-[10px] font-mono text-slate-400 border-b border-slate-900 pb-2">
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase">Source</span>
                      <span className="text-slate-300 font-semibold">{claim.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase">Target</span>
                      <span className="text-slate-300 font-semibold">{claim.target}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase">Policy Bound</span>
                      <span className={claim.policy_version !== policy.policy_version ? "text-rose-400 font-bold" : "text-slate-400"}>
                        {claim.policy_version}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase">Confidence</span>
                      <span className={claim.confidence !== null && claim.confidence < policy.required_confidence_threshold ? "text-rose-400 font-bold" : "text-emerald-400"}>
                        {claim.confidence !== null ? claim.confidence.toFixed(2) : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 italic mb-2 leading-relaxed">
                    "{claim.rationale}"
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>Declared: <span className="text-slate-400">{claim.declared_by}</span></span>
                    <span>Status: <span className="text-slate-400">{claim.interpretation_status || InterpretationStatus.CANONICAL}</span></span>
                  </div>
                </div>
              );
            })}

            {claims.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 italic">
                Claims manifest is empty. Declare claims below to begin compilation.
              </div>
            )}
          </div>

          {/* Form to propose/declare a new claim */}
          <form onSubmit={handleAddClaim} className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              Declare New Claim Entity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Claim ID (Unique)</label>
                <input
                  type="text"
                  placeholder="e.g., claim_005"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Source node</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Target node</label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Edge Family</label>
                <select
                  value={newFamily}
                  onChange={(e) => setNewFamily(e.target.value as EdgeFamily)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono text-ellipsis overflow-hidden"
                >
                  {Object.values(EdgeFamily).map(fam => (
                    <option key={fam} value={fam}>{fam}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Confidence</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Bound Policy Version</label>
                <input
                  type="text"
                  value={newPolicyVersion}
                  onChange={(e) => setNewPolicyVersion(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Declared By</label>
                <input
                  type="text"
                  value={newDeclaredBy}
                  onChange={(e) => setNewDeclaredBy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <label className="text-[10px] text-slate-500 font-mono uppercase">Rationale Explanation</label>
              <input
                type="text"
                placeholder="Declare the logical, symbolic, or textual evidence for this edge..."
                value={newRationale}
                onChange={(e) => setNewRationale(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Declare & Commit
              </button>
            </div>
          </form>
        </div>

        {/* Policy Configuration Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-display font-semibold text-slate-100 flex items-center gap-2 text-sm mb-3">
            <Settings className="text-slate-400 w-4.5 h-4.5" />
            Policy Rule Artifact (v3.2.8 Specs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Required Confidence</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-emerald-400 font-bold">≥ {policy.required_confidence_threshold}</span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.0" 
                  step="0.05"
                  value={policy.required_confidence_threshold}
                  onChange={(e) => {
                    const newThreshold = Number(e.target.value);
                    const updatedPolicy = { ...policy, required_confidence_threshold: newThreshold };
                    setPolicy(updatedPolicy);
                    executeCompilation(claims, updatedPolicy);
                  }}
                  className="w-20 cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Restricted Scopes</div>
              <div className="font-mono text-xs text-rose-400 font-semibold">
                {policy.restricted_scopes.join(", ")}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Allowed Families</div>
              <div className="font-mono text-[9px] text-slate-400 line-clamp-2">
                {policy.allowed_families.join(", ")}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Compilation Artifacts, Receipts & pytest suite */}
      <div className="xl:col-span-5 flex flex-col gap-6">

        {/* Global Notification Alerts */}
        {alert && (
          <div className={`p-4 rounded-xl border flex gap-3 items-start ${
            alert.type === "success"
              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
              : alert.type === "error"
              ? "bg-rose-950/20 border-rose-900/30 text-rose-400"
              : "bg-blue-950/20 border-blue-900/30 text-blue-400"
          }`}>
            {alert.type === "success" ? (
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : alert.type === "error" ? (
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-5 h-5 shrink-0 text-blue-400" />
            )}
            <div className="text-xs">
              <div className="font-semibold uppercase tracking-wider mb-0.5">
                {alert.type === "success" ? "System Verification OK" : alert.type === "error" ? "Compiler Warning / Error" : "System Notification"}
              </div>
              <div className="leading-relaxed">{alert.text}</div>
            </div>
          </div>
        )}

        {/* Deterministic Topology Receipt & Artifacts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-display font-semibold text-slate-100 flex items-center gap-2 text-sm mb-3">
            <Layers className="text-slate-400 w-4.5 h-4.5" />
            Topology Receipt & Multi-Relational Projections
          </h3>

          {activeReceipt ? (
            <div className="flex flex-col gap-4">
              {/* Receipt Header details */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono leading-relaxed">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
                  <span className="text-emerald-400 font-bold">RECEIPT_ID: {activeReceipt.receipt_id}</span>
                  <span className="text-slate-500 font-semibold">{activeReceipt.schema_version} Protocol</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>claims_hash:</span>
                    <span className="text-slate-300 font-semibold">{activeReceipt.claims_hash.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>policy_hash:</span>
                    <span className="text-slate-300 font-semibold">{activeReceipt.policy_hash.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>compiler_hash:</span>
                    <span className="text-slate-300 font-semibold">{activeReceipt.compiler_hash.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-2 text-slate-300">
                    <span>canonical_hash:</span>
                    <span className="text-emerald-400 font-bold">{activeReceipt.canonical_hash.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between pt-1 text-slate-400">
                    <span>feedback_scc_count:</span>
                    <span className="text-amber-400 font-bold">{activeReceipt.feedback_scc_count} loops</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900/50">
                    <span>Compiler Spec:</span>
                    <span>{activeReceipt.compiler_version}</span>
                  </div>
                </div>
              </div>

              {/* Validation Warnings List if exist */}
              {validationErrors.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg flex flex-col gap-1">
                  <div className="text-[10px] text-rose-400 font-bold uppercase font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Validation & Cycle Warnings
                  </div>
                  <ul className="list-disc pl-4 text-[10px] text-rose-300 font-mono flex flex-col gap-1 mt-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Projection Tabs */}
              <div className="border-t border-slate-800 pt-3">
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">Select Multi-Relational Projection View</div>
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {(["canonical", "execution", "realization", "ecology", "symbolic", "ontology", "aggregate"] as const).map((kind) => {
                    const isSelected = selectedProjection === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setSelectedProjection(kind)}
                        className={`py-1 text-[9px] font-mono rounded border capitalize transition-all cursor-pointer truncate ${
                          isSelected
                            ? "bg-slate-800 border-emerald-500 text-emerald-400 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                        title={kind}
                      >
                        {kind}
                      </button>
                    );
                  })}
                </div>

                {/* Graph Analysis metrics */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-[11px] font-mono mb-3">
                  <div className="flex justify-between items-center mb-1.5 border-b border-slate-900 pb-1.5">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Projection Safety Guard</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      {selectedProjection} View
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduler Safety (Is DAG):</span>
                      <span className={isProjectedDag ? "text-emerald-400 font-semibold" : "text-rose-500 font-bold"}>
                        {isProjectedDag ? "SAFE (TRUE)" : "CYCLE WARNING (FALSE)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Strongly Connected Loops:</span>
                      <span className={projectedSccs.length > 0 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                        {projectedSccs.length} detected
                      </span>
                    </div>
                    {projectedSccs.map((comp, idx) => {
                      const kind = classifyFeedbackScc(build_multigraph_from_records(claims), comp);
                      return (
                        <div key={idx} className="bg-[#0b0c16] border border-amber-950/40 rounded p-1.5 mt-1.5 flex flex-col gap-1 text-[10px]">
                          <div className="flex justify-between font-bold text-amber-500">
                            <span>SCC Loop #{idx + 1}</span>
                            <span className="text-emerald-500">{kind}</span>
                          </div>
                          <div className="text-slate-400 leading-relaxed text-[9px]">
                            {Array.from(comp).join(" ⇄ ")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Derived Artifact Graph Representation */}
                <div className="bg-[#050811] rounded-lg border border-slate-800 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Attributed Projection Edges ({projectedEdges.length})</div>
                    {selectedProjection !== "canonical" && activeReceipt.projection_hashes[selectedProjection] && (
                      <span className="text-[8px] font-mono text-slate-500">
                        hash: {activeReceipt.projection_hashes[selectedProjection].substring(0, 10)}...
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 terminal-scroll">
                    {projectedEdges.map((edge) => (
                      <div
                        key={edge.edge_id}
                        className="bg-slate-900/80 border border-slate-800/80 text-[10px] font-mono p-2 rounded flex flex-col gap-1"
                      >
                        <div className="flex justify-between text-[9px] gap-4">
                          <span className="text-emerald-400 font-bold">{edge.edge_id}</span>
                          <span className="text-slate-500">{edge.family}</span>
                        </div>
                        <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <span>{edge.source}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-500" />
                          <span>{edge.target}</span>
                        </div>
                      </div>
                    ))}
                    {projectedEdges.length === 0 && (
                      <div className="text-xs text-rose-500 font-mono italic p-2 text-center">
                        Empty projection. No edge families declared map to {selectedProjection}.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deterministic Replay Verification Actions */}
              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-[10px] text-slate-500 font-bold font-mono uppercase mb-2">REPLAY VALIDATION ENGINE</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={verifyReceipt}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center"
                    >
                      Verify Recompilation
                    </button>
                    <button
                      onClick={triggerTamperAttack}
                      className="flex-1 py-1.5 bg-rose-950/20 hover:bg-rose-950/30 border border-rose-900/30 text-rose-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center"
                    >
                      Simulate Tamper
                    </button>
                  </div>
                  <button
                    onClick={executeStandaloneVerifier}
                    className="w-full py-2 bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Run Standalone Verifier (python -m jubilee.verify_receipts)
                  </button>
                </div>

                {/* Threat Model Panel */}
                <div className="mt-3 border border-slate-800 bg-[#070b19]/60 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed">
                  <div className="flex justify-between items-center mb-1.5 text-slate-400 font-bold border-b border-slate-900 pb-1">
                    <span className="uppercase text-[9px] text-slate-500">VERIFIER THREAT MODEL (evidence/verification-scope.json)</span>
                    <span className="text-amber-500/80">local_reproducibility</span>
                  </div>
                  <div className="text-slate-400 mb-1.5">
                    <span className="text-emerald-400/80 font-bold">CLAIMS AS WITNESSED:</span>
                    <ul className="list-disc list-inside pl-1 text-[9px] text-slate-300">
                      <li>Inputs match hashes</li>
                      <li>Outputs reproduce hashes</li>
                      <li>Projection constraints pass</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-rose-400/80 font-bold">DOES NOT CLAIM:</span>
                    <ul className="list-disc list-inside pl-1 text-[9px] text-slate-300">
                      <li>Human authorship</li>
                      <li>External authority</li>
                      <li>Semantic truth</li>
                      <li>Permanent availability</li>
                    </ul>
                  </div>
                </div>

                {verificationResult && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono leading-relaxed">
                    <div className="flex justify-between items-center mb-2 font-bold">
                      <span>VERIFICATION SUMMARY:</span>
                      <span className={verificationResult.overall_valid ? "text-emerald-400" : "text-rose-400"}>
                        {verificationResult.overall_valid ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400">
                      <div>Claims Match: <span className={verificationResult.claims_match ? "text-emerald-400" : "text-rose-400"}>{String(verificationResult.claims_match)}</span></div>
                      <div>Policy Match: <span className={verificationResult.policy_match ? "text-emerald-400" : "text-rose-400"}>{String(verificationResult.policy_match)}</span></div>
                      <div>Compiler Match: <span className={verificationResult.compiler_match ? "text-emerald-400" : "text-rose-400"}>{String(verificationResult.compiler_match)}</span></div>
                      <div>Artifact Match: <span className={verificationResult.artifact_hashes_match ? "text-emerald-400" : "text-rose-400"}>{String(verificationResult.artifact_hashes_match)}</span></div>
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-2 leading-relaxed">
                      *Verification engine NEVER returns truth assertions; it only reports on deterministic replication and policy-compliance matches.
                    </div>
                  </div>
                )}

                {standaloneVerifierResult && (
                  <div className="mt-3 bg-[#030610] border border-slate-800 rounded-lg p-3 font-mono text-[11px] leading-relaxed">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-1.5 font-bold">
                      <span className="text-slate-400 uppercase text-[9px]">Standalone Verifier Terminal</span>
                      <span className={standaloneVerifierResult.status === "VALID" ? "text-emerald-400" : "text-rose-400"}>
                        {standaloneVerifierResult.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1 terminal-scroll mb-3 text-[10px]">
                      {standaloneVerifierResult.logs.map((log: string, idx: number) => {
                        let color = "text-slate-400";
                        if (log.startsWith("$")) color = "text-emerald-400 font-bold";
                        else if (log.startsWith("[OK]") || log.startsWith("[SUCCESS]")) color = "text-emerald-400";
                        else if (log.startsWith("[MALFORMED]") || log.startsWith("[MISMATCH]") || log.startsWith("[UNREPRODUCIBLE]") || log.startsWith("[WARNING]")) color = "text-rose-400 font-semibold";
                        return (
                          <div key={idx} className={color}>
                            {log}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[10px] bg-slate-900/50 p-2.5 rounded border border-slate-800/60 leading-relaxed text-slate-300 mb-3">
                      <span className="text-amber-400 font-semibold uppercase text-[9px] block mb-0.5">Bounded Conclusion Statement:</span>
                      {standaloneVerifierResult.conclusion}
                    </div>

                    {standaloneVerifierResult.certificate && (
                      <div className="mt-3 border border-amber-900/30 bg-amber-950/5 rounded-lg p-3 font-mono text-[11px] leading-relaxed">
                        <div className="flex justify-between items-center mb-1.5 font-bold text-amber-400 border-b border-amber-900/20 pb-1">
                          <span className="text-[10px] tracking-wider uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                            Projection Stability Certificate
                          </span>
                          <span className="text-[9px] text-slate-500">
                            v{standaloneVerifierResult.certificate.certificate_version}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex flex-col gap-1.5 mb-2.5">
                          <div>
                            <span className="text-slate-500 font-bold block">CERTIFICATE HASH:</span>
                            <span className="text-amber-500 font-semibold text-[9px] break-all">
                              {standaloneVerifierResult.certificate.certificate_hash}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">VERIFIED RECEIPT:</span>
                            <span className="text-slate-300 text-[9px] break-all">
                              {standaloneVerifierResult.certificate.verified_receipt_hash}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <div>
                              <span className="text-slate-500 font-bold block">VERIFIED AT:</span>
                              <span className="text-slate-300">{standaloneVerifierResult.certificate.verified_at}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold block">VERIFIER ID HASH:</span>
                              <span className="text-slate-300 text-[8px] break-all">
                                {standaloneVerifierResult.certificate.verifier_identity_hash.substring(0, 16)}...
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-slate-900 pt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                            <div>
                              <span className="text-slate-500 font-semibold block">Claims Hash:</span>
                              <span className="text-slate-400 break-all">{standaloneVerifierResult.certificate.claims_hash.substring(0, 12)}...</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block">Policy Hash:</span>
                              <span className="text-slate-400 break-all">{standaloneVerifierResult.certificate.policy_hash.substring(0, 12)}...</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block">Compiler Identity Hash:</span>
                              <span className="text-slate-400 break-all">{standaloneVerifierResult.certificate.compiler_identity_hash.substring(0, 12)}...</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block">Canonical Hash:</span>
                              <span className="text-slate-400 break-all">{standaloneVerifierResult.certificate.canonical_hash.substring(0, 12)}...</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-slate-900 pt-2 mb-2">
                          <span className="text-slate-500 font-bold text-[9px] block mb-1">STABILITY CHECKS:</span>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                            {Object.entries(standaloneVerifierResult.certificate.checks).map(([key, val]) => (
                              <div key={key} className="flex items-center gap-1.5">
                                <span className={val ? "text-emerald-400 font-bold" : "text-slate-600"}>
                                  {val ? "✓" : "✗"}
                                </span>
                                <span className="text-slate-400 text-[8.5px] truncate capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-amber-950/10 border border-amber-900/20 p-2 rounded text-[10px] italic text-amber-300/80 leading-relaxed">
                          <span className="text-amber-400 font-semibold uppercase text-[8px] block not-italic mb-0.5">Assertion:</span>
                          "{standaloneVerifierResult.certificate.assertion}"
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-slate-500 italic text-xs py-6 text-center">
              Please execute a compilation to inspect outputs.
            </div>
          )}
        </div>

        {/* 10-Step Lifecycle Pytest Terminal Spec */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col min-h-[340px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
            <div>
              <h3 className="font-display font-semibold text-slate-100 flex items-center gap-1.5 text-sm">
                <Terminal className="text-slate-400 w-4.5 h-4.5" />
                Pytest Vertical Slice Terminal
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Execute the strict 10-step verification test sequence.
              </p>
            </div>
            <button
              onClick={executePytestRunner}
              disabled={pytestStatus === "RUNNING"}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Pytest
            </button>
          </div>

          <div className="flex-1 bg-[#050811] rounded-lg p-3 font-mono text-[11px] leading-relaxed border border-slate-800 text-slate-300 overflow-y-auto max-h-[300px] terminal-scroll flex flex-col gap-1.5">
            {pytestLogs.map((log, index) => {
              let color = "text-slate-400";
              if (log.startsWith("$")) color = "text-emerald-400 font-bold";
              else if (log.includes("PASSED") || log.startsWith("> claims_hash match") || log.startsWith("> policy_hash match") || log.startsWith("> canonical_graph_hash match") || log.startsWith("> claims_hash changed") || log.startsWith("> receipt_id changed") || log.startsWith("> Execution is DAG") || log.startsWith("> Realization is DAG")) color = "text-emerald-400 font-semibold";
              else if (log.includes("FAILED") || log.startsWith("[error]")) color = "text-rose-500 font-bold";
              else if (log.includes("Step")) color = "text-amber-400 font-semibold";
              else if (log.startsWith("=====") || log.startsWith("-----")) color = "text-slate-600";
              return (
                <div key={index} className={color}>
                  {log}
                </div>
              );
            })}
            {pytestLogs.length === 0 && (
              <div className="text-slate-500 italic text-center my-auto">
                Click "Run Pytest" above to run the 10-step vertical slice compilation sequence.
              </div>
            )}
          </div>

          {pytestStatus !== "IDLE" && (
            <div className="mt-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Suite Status:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded border ${
                pytestStatus === "RUNNING"
                  ? "bg-slate-900 border-slate-800 text-slate-400"
                  : pytestStatus === "PASSED"
                  ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
                  : "bg-rose-950/20 border-rose-900/30 text-rose-400"
              }`}>
                {pytestStatus}
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
