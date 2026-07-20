// Genesis-John Engine - Definitive Policy & Entrustment Guardrails
// Enforces immutable edge manifests, explicit projection mappings, and strict schema guardrails.

export enum EdgeFamily {
  // Ontology Layer
  CONTAINS = "CONTAINS",
  DECLARES_NAMESPACE = "DECLARES_NAMESPACE",
  INCARNATES = "INCARNATES",
  
  // Execution Layer
  DEPENDS_ON = "DEPENDS_ON",
  PRECEDES = "PRECEDES",
  REQUIRES = "REQUIRES",
  
  // Realization Layer
  ENCOUNTERS = "ENCOUNTERS",
  REJECTS = "REJECTS",
  RECEIVES = "RECEIVES",
  GRANTS = "GRANTS",
  
  // Ecology Layer
  POPULATES = "POPULATES",
  NOURISHES = "NOURISHES",
  GOVERNS = "GOVERNS",
  
  // Symbolic Layer
  SCOPE_MIRRORS = "SCOPE_MIRRORS",
  IMPORTS = "IMPORTS",
  TESTIFIES_ABOUT = "TESTIFIES_ABOUT",
}

export enum ProjectionKind {
  EXECUTION = "execution",
  ONTOLOGY = "ontology",
  ECOLOGY = "ecology",
  SYMBOLIC = "symbolic",
  REALIZATION = "realization",
  AGGREGATE = "aggregate",
}

export enum InterpretationStatus {
  CANONICAL = "canonical",
  DERIVED = "derived",
  SPECULATIVE = "speculative",
}

export enum EpistemicStatus {
  OBSERVED = "OBSERVED",
  DERIVED = "DERIVED",
  INTERPRETIVE = "INTERPRETIVE",
}

export enum FeedbackKind {
  ECOLOGICAL = "ECOLOGICAL",
  CROSS_FAMILY = "CROSS_FAMILY",
  SYMBOLIC = "SYMBOLIC",
  REALIZATION = "REALIZATION",
}

export interface EdgeRecord {
  edge_id: string;
  source: string;
  target: string;
  family: EdgeFamily;
  rationale: string;
  interpretation_status?: InterpretationStatus;
  epistemic_status?: EpistemicStatus; // for legacy compatibility
  source_path: string;
  source_hash: string;
  declared_by: string;
  policy_version?: string; // made optional for backward compatibility
  declared_policy_version?: string | null; // treated as an optional compatibility constraint
  policy_hash?: string;
  confidence: number | null;
  derived_from: string[];
}

export const ALLOWED_PROJECTIONS: Record<EdgeFamily, Set<ProjectionKind>> = {
  [EdgeFamily.CONTAINS]: new Set([ProjectionKind.ONTOLOGY, ProjectionKind.AGGREGATE]),
  [EdgeFamily.DECLARES_NAMESPACE]: new Set([ProjectionKind.ONTOLOGY, ProjectionKind.AGGREGATE]),
  [EdgeFamily.INCARNATES]: new Set([ProjectionKind.REALIZATION, ProjectionKind.AGGREGATE]),

  [EdgeFamily.DEPENDS_ON]: new Set([ProjectionKind.EXECUTION, ProjectionKind.AGGREGATE]),
  [EdgeFamily.PRECEDES]: new Set([ProjectionKind.EXECUTION, ProjectionKind.AGGREGATE]),
  [EdgeFamily.REQUIRES]: new Set([ProjectionKind.EXECUTION, ProjectionKind.AGGREGATE]),

  [EdgeFamily.ENCOUNTERS]: new Set([ProjectionKind.REALIZATION, ProjectionKind.AGGREGATE]),
  [EdgeFamily.REJECTS]: new Set([ProjectionKind.REALIZATION, ProjectionKind.AGGREGATE]),
  [EdgeFamily.RECEIVES]: new Set([ProjectionKind.REALIZATION, ProjectionKind.AGGREGATE]),
  [EdgeFamily.GRANTS]: new Set([ProjectionKind.REALIZATION, ProjectionKind.AGGREGATE]),

  [EdgeFamily.POPULATES]: new Set([ProjectionKind.ECOLOGY, ProjectionKind.AGGREGATE]),
  [EdgeFamily.NOURISHES]: new Set([ProjectionKind.ECOLOGY, ProjectionKind.AGGREGATE]),
  [EdgeFamily.GOVERNS]: new Set([ProjectionKind.ECOLOGY, ProjectionKind.AGGREGATE]),

  [EdgeFamily.SCOPE_MIRRORS]: new Set([ProjectionKind.SYMBOLIC, ProjectionKind.AGGREGATE]),
  [EdgeFamily.IMPORTS]: new Set([ProjectionKind.SYMBOLIC, ProjectionKind.AGGREGATE]),
  [EdgeFamily.TESTIFIES_ABOUT]: new Set([ProjectionKind.SYMBOLIC, ProjectionKind.AGGREGATE]),
};

export class SchemaDriftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaDriftError";
  }
}

export class PolicyBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolicyBindingError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const SEMANTIC_FIELDS = [
  "edge_id", "family", "rationale", "interpretation_status", "confidence",
  "source_path", "source_hash", "declared_by", "policy_version", "policy_hash",
  "derived_from", "projection_kind", "projection_edge"
] as const;

// Deterministic non-temporal string hashing helper
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const absHash = Math.abs(hash).toString(16).padEnd(8, "f");
  return `sha256_${absHash}`.padEnd(64, "0");
}

export function deterministicStringify(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(deterministicStringify).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const parts = keys.map(k => {
    const val = obj[k];
    return `${JSON.stringify(k)}:${deterministicStringify(val)}`;
  });
  return "{" + parts.join(",") + "}";
}

// Emulates networkx MultiDiGraph
export interface MultiDiGraphEdge {
  source: string;
  target: string;
  key: string;
  data: Record<string, any>;
}

export class MultiDiGraph {
  public nodes: Set<string> = new Set();
  public edges: MultiDiGraphEdge[] = [];
  public graph: Record<string, any> = {};

  addNode(node: string) {
    this.nodes.add(node);
  }

  addEdge(source: string, target: string, key: string, data: Record<string, any> = {}) {
    this.nodes.add(source);
    this.nodes.add(target);
    this.edges.push({ source, target, key, data });
  }

  copy(): MultiDiGraph {
    const g = new MultiDiGraph();
    g.nodes = new Set(this.nodes);
    g.edges = this.edges.map(e => ({
      source: e.source,
      target: e.target,
      key: e.key,
      data: { ...e.data }
    }));
    g.graph = { ...this.graph };
    return g;
  }
}

export function compute_stable_multigraph_hash(graph: MultiDiGraph): string {
  const edgesRaw = graph.edges.map(e => {
    const attributes: Record<string, any> = {};
    for (const field of SEMANTIC_FIELDS) {
      if (field in e.data && e.data[field] !== undefined) {
        attributes[field] = e.data[field];
      }
    }
    return {
      source: String(e.source),
      target: String(e.target),
      key: String(e.key),
      attributes
    };
  });

  const sortedEdges = edgesRaw.sort((a, b) => {
    const keyA = `${a.source}_${a.target}_${a.key}`;
    const keyB = `${b.source}_${b.target}_${b.key}`;
    return keyA.localeCompare(keyB);
  });

  const payload = {
    projection_kind: graph.graph["projection_kind"] || "canonical",
    nodes: Array.from(graph.nodes).map(String).sort(),
    edges: sortedEdges,
  };

  return hashString(deterministicStringify(payload));
}

export function project(graph: MultiDiGraph, target_kind: ProjectionKind): MultiDiGraph {
  const view = new MultiDiGraph();
  view.graph["projection_kind"] = target_kind;
  
  for (const node of graph.nodes) {
    view.addNode(node);
  }

  const allowed_strings = new Set<string>();
  for (const [fam, kinds] of Object.entries(ALLOWED_PROJECTIONS)) {
    if (kinds.has(target_kind)) {
      allowed_strings.add(fam);
    }
  }

  for (const edge of graph.edges) {
    const raw_family = edge.data["family"];
    if (!raw_family) {
      throw new SchemaDriftError(`Missing authority classification between ${edge.source} -> ${edge.target}`);
    }

    const family = raw_family as EdgeFamily;
    if (!Object.values(EdgeFamily).includes(family)) {
      throw new SchemaDriftError(`Schema Drift: Unrecognized relation '${raw_family}'`);
    }

    const allowed_kinds = ALLOWED_PROJECTIONS[family] || new Set();
    if (!allowed_kinds.has(target_kind)) {
      continue;
    }

    const projected_data = { ...edge.data };
    projected_data["projection_kind"] = target_kind;
    projected_data["projection_edge"] = `${target_kind}:${edge.source}->${edge.target}:${edge.key}`;
    projected_data["derived_from"] = edge.data["derived_from"] || edge.data["edge_id"];

    view.addEdge(edge.source, edge.target, edge.key, projected_data);
  }

  // Sanitization Verification Guard Pass
  for (const edge of view.edges) {
    if (!allowed_strings.has(edge.data["family"])) {
      throw new SchemaDriftError(
        `Sanitization breach: unauthorized family leaked into ${target_kind}: ${edge.data["family"]}`
      );
    }
  }

  return view;
}

export interface FeedbackSummary {
  dissent_count: number;
  protest_hash: string;
}

export interface TopologyReceipt {
  receipt_id: string;
  activity_id?: string;
  compiler_version: string;
  compiler_hash: string;
  compiler_identity?: CompilerIdentity;
  compiler_identity_hash?: string;
  schema_version: string;
  policy_version: string;
  policy_hash: string;
  claims_hash: string;
  source_hashes: Record<string, string>;
  parent_receipts: string[];
  canonical_hash: string;
  canonical_graph_hash: string; // for compatibility
  projection_hashes: Record<string, string>;
  validation_passed: boolean;
  validation_errors: string[];
  feedback_scc_count: number;
  feedback_summary?: FeedbackSummary;
  generated_at: string;
}

export interface CompilerIdentity {
  compiler_name: string;
  compiler_version: string;
  compiler_hash: string;
  policy_engine_hash: string;
  schema_hash: string;
  adapter_map_version: string;
  adapter_map_hash: string;
}

export function compute_compiler_identity_hash(identity: CompilerIdentity): string {
  return hashString(deterministicStringify(identity));
}

export const DEFAULT_COMPILER_IDENTITY: CompilerIdentity = {
  compiler_name: "JubileeCoreCompiler",
  compiler_version: "v3.2.4-reproducibility",
  compiler_hash: "sha256_v3_2_4_compiler_core_hash_val",
  policy_engine_hash: "sha256_v3_2_4_policy_engine_hash_val",
  schema_hash: "sha256_v3_2_4_schema_hash_val",
  adapter_map_version: "v1.0.2",
  adapter_map_hash: "sha256_v3_2_4_adapter_map_hash_val"
};

export interface PolicyArtifact {
  policy_version: string;
  allowed_families: EdgeFamily[];
  restricted_scopes: string[];
  required_confidence_threshold: number;
}

export interface CompilationActivity {
  activity_id: string;
  compiler_name: string;
  compiler_version: string;
  compiler_hash: string;
  schema_version: string;
  policy_version: string;
  policy_hash: string;
  input_claims_hash: string;
  parent_receipts: string[];
  started_at: string;
  completed_at: string;
}

export interface CanonicalGraph {
  nodes: string[];
  edges: {
    edge_id: string;
    source: string;
    target: string;
    family: EdgeFamily;
    claims_source: string;
  }[];
}

export function classifyFeedbackScc(aggregate: MultiDiGraph, members: Set<string>): FeedbackKind {
  const families = new Set<EdgeFamily>();
  for (const edge of aggregate.edges) {
    if (members.has(edge.source) && members.has(edge.target)) {
      if (edge.data["family"]) {
        families.add(edge.data["family"] as EdgeFamily);
      }
    }
  }

  if (families.size === 0) {
    return FeedbackKind.SYMBOLIC;
  }
  if (families.size > 1) {
    return FeedbackKind.CROSS_FAMILY;
  }

  const family = Array.from(families)[0];
  if (family === EdgeFamily.POPULATES || family === EdgeFamily.NOURISHES) {
    return FeedbackKind.ECOLOGICAL;
  }
  if (
    family === EdgeFamily.INCARNATES ||
    family === EdgeFamily.ENCOUNTERS ||
    family === EdgeFamily.REJECTS ||
    family === EdgeFamily.RECEIVES ||
    family === EdgeFamily.GRANTS
  ) {
    return FeedbackKind.REALIZATION;
  }
  return FeedbackKind.SYMBOLIC;
}

export function build_multigraph_from_records(records: EdgeRecord[]): MultiDiGraph {
  const graph = new MultiDiGraph();
  for (const rec of records) {
    graph.addNode(rec.source);
    graph.addNode(rec.target);
    graph.addEdge(rec.source, rec.target, rec.edge_id, {
      edge_id: rec.edge_id,
      family: rec.family,
      rationale: rec.rationale,
      interpretation_status: rec.interpretation_status || InterpretationStatus.CANONICAL,
      confidence: rec.confidence,
      source_path: rec.source_path,
      source_hash: rec.source_hash,
      declared_by: rec.declared_by,
      policy_version: rec.policy_version,
      policy_hash: rec.policy_hash || "",
      derived_from: rec.derived_from || []
    });
  }
  return graph;
}

export function isDirectedAcyclicGraph(graph: MultiDiGraph): { isDag: boolean; cycles: string[][] } {
  const adj: Record<string, string[]> = {};
  for (const node of graph.nodes) {
    adj[node] = [];
  }
  for (const edge of graph.edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  }

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  const cycles: string[][] = [];

  function dfs(node: string, currentPath: string[]): boolean {
    visited[node] = true;
    recStack[node] = true;
    currentPath.push(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        if (dfs(neighbor, currentPath)) return true;
      } else if (recStack[neighbor]) {
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          cycles.push(currentPath.slice(cycleStartIndex).concat(neighbor));
        }
        return true;
      }
    }

    recStack[node] = false;
    currentPath.pop();
    return false;
  }

  let isDag = true;
  for (const node of graph.nodes) {
    if (!visited[node]) {
      if (dfs(node, [])) {
        isDag = false;
      }
    }
  }

  return { isDag, cycles };
}

export function is_feedback_component(graph: MultiDiGraph, component: Set<string>): boolean {
  if (component.size > 1) {
    return true;
  }
  // Check for self-loop (has an edge from node to node)
  const node = Array.from(component)[0];
  return graph.edges.some(e => e.source === node && e.target === node);
}

export function getStronglyConnectedComponents(graph: MultiDiGraph): Set<string>[] {
  const adj: Record<string, string[]> = {};
  for (const node of graph.nodes) {
    adj[node] = [];
  }
  for (const edge of graph.edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  }

  let index = 0;
  const indices: Record<string, number> = {};
  const lowlink: Record<string, number> = {};
  const onStack: Record<string, boolean> = {};
  const stack: string[] = [];
  const sccs: Set<string>[] = [];

  function strongconnect(v: string) {
    indices[v] = index;
    lowlink[v] = index;
    index++;
    stack.push(v);
    onStack[v] = true;

    const neighbors = adj[v] || [];
    for (const w of neighbors) {
      if (indices[w] === undefined) {
        strongconnect(w);
        lowlink[v] = Math.min(lowlink[v], lowlink[w]);
      } else if (onStack[w]) {
        lowlink[v] = Math.min(lowlink[v], indices[w]);
      }
    }

    if (lowlink[v] === indices[v]) {
      const scc = new Set<string>();
      let w: string;
      do {
        w = stack.pop()!;
        onStack[w] = false;
        scc.add(w);
      } while (w !== v);
      sccs.push(scc);
    }
  }

  for (const node of graph.nodes) {
    if (indices[node] === undefined) {
      strongconnect(node);
    }
  }

  return sccs.filter(scc => scc.size > 1 || is_feedback_component(graph, scc));
}

export const CLAIM_FIELDS = [
  "edge_id",
  "source",
  "target",
  "family",
  "rationale",
  "interpretation_status",
  "confidence",
  "source_path",
  "source_hash",
  "declared_by",
  "derived_from",
] as const;

export function compute_claims_hash(graph: MultiDiGraph): string {
  const claims = graph.edges.map(e => {
    const claimObj: Record<string, any> = {};
    for (const field of CLAIM_FIELDS) {
      if (field in e.data && e.data[field] !== undefined) {
        claimObj[field] = e.data[field];
      } else if (field === "source") {
        claimObj[field] = e.source;
      } else if (field === "target") {
        claimObj[field] = e.target;
      }
    }
    return {
      source: String(e.source),
      target: String(e.target),
      key: String(e.key),
      claim: claimObj
    };
  });

  const sortedClaims = claims.sort((a, b) => {
    const keyA = `${a.source}_${a.target}_${a.key}`;
    const keyB = `${b.source}_${b.target}_${b.key}`;
    return keyA.localeCompare(keyB);
  });

  return hashString(deterministicStringify({ claims: sortedClaims }));
}

export function compute_compilation_hash(params: {
  claims_hash: string;
  policy_hash: string;
  compiler_identity_hash: string;
  schema_version: string;
  canonical_hash: string;
  projection_hashes: Record<string, string>;
}): string {
  const sortedProjections: Record<string, string> = {};
  const keys = Object.keys(params.projection_hashes).sort();
  for (const k of keys) {
    sortedProjections[k] = params.projection_hashes[k];
  }

  const payload = {
    claims_hash: params.claims_hash,
    policy_hash: params.policy_hash,
    compiler_identity_hash: params.compiler_identity_hash,
    schema_version: params.schema_version,
    canonical_hash: params.canonical_hash,
    projection_hashes: sortedProjections
  };

  return hashString(deterministicStringify(payload));
}

export function evaluate_compilation_activity(
  canonical_graph: MultiDiGraph,
  source_hashes: Record<string, string>,
  policy_version: string,
  policy_hash: string,
  compiler_identity: CompilerIdentity = DEFAULT_COMPILER_IDENTITY,
  parent_receipts: string[] = []
): { receipt: TopologyReceipt; breakdown: Record<FeedbackKind, number> } {
  const errors: string[] = [];

  const execution = project(canonical_graph, ProjectionKind.EXECUTION);
  const ontology = project(canonical_graph, ProjectionKind.ONTOLOGY);
  const ecology = project(canonical_graph, ProjectionKind.ECOLOGY);
  const symbolic = project(canonical_graph, ProjectionKind.SYMBOLIC);
  const realization = project(canonical_graph, ProjectionKind.REALIZATION);
  const aggregate = project(canonical_graph, ProjectionKind.AGGREGATE);

  const execDagCheck = isDirectedAcyclicGraph(execution);
  if (!execDagCheck.isDag) {
    errors.push(`Execution projection contains precedence cycles: ${JSON.stringify(execDagCheck.cycles)}`);
  }
  const ontDagCheck = isDirectedAcyclicGraph(ontology);
  if (!ontDagCheck.isDag) {
    errors.push(`Ontology projection contains containment cycles: ${JSON.stringify(ontDagCheck.cycles)}`);
  }

  const sccs = getStronglyConnectedComponents(aggregate);

  const breakdown: Record<FeedbackKind, number> = {
    [FeedbackKind.ECOLOGICAL]: 0,
    [FeedbackKind.CROSS_FAMILY]: 0,
    [FeedbackKind.SYMBOLIC]: 0,
    [FeedbackKind.REALIZATION]: 0,
  };

  for (const comp of sccs) {
    const kind = classifyFeedbackScc(aggregate, comp);
    breakdown[kind] += 1;
  }

  const proj_hashes: Record<string, string> = {
    "execution": compute_stable_multigraph_hash(execution),
    "ontology": compute_stable_multigraph_hash(ontology),
    "ecology": compute_stable_multigraph_hash(ecology),
    "symbolic": compute_stable_multigraph_hash(symbolic),
    "realization": compute_stable_multigraph_hash(realization),
    "aggregate": compute_stable_multigraph_hash(aggregate),
  };

  const claims_hash = compute_claims_hash(canonical_graph);
  const canonical_hash = compute_stable_multigraph_hash(canonical_graph);
  const schema_version = "v3.2";
  const compiler_identity_hash = compute_compiler_identity_hash(compiler_identity);

  const compilation_hash = compute_compilation_hash({
    claims_hash,
    policy_hash,
    compiler_identity_hash,
    schema_version,
    canonical_hash,
    projection_hashes: proj_hashes
  });

  const receipt_id = `sha256:${compilation_hash}`;

  const receipt: TopologyReceipt = {
    receipt_id,
    compiler_version: compiler_identity.compiler_version,
    compiler_hash: compiler_identity.compiler_hash,
    compiler_identity,
    compiler_identity_hash,
    schema_version,
    policy_version,
    policy_hash,
    claims_hash,
    source_hashes,
    parent_receipts,
    canonical_hash,
    canonical_graph_hash: canonical_hash,
    projection_hashes: proj_hashes,
    validation_passed: errors.length === 0,
    validation_errors: errors,
    feedback_scc_count: sccs.length,
    generated_at: "2026-07-20T12:00:02Z",
  };

  return { receipt, breakdown };
}

export function normalizeRecord(rec: EdgeRecord): EdgeRecord {
  let interpretation_status = rec.interpretation_status;
  if (!interpretation_status) {
    if (rec.epistemic_status === EpistemicStatus.OBSERVED) {
      interpretation_status = InterpretationStatus.CANONICAL;
    } else if (rec.epistemic_status === EpistemicStatus.DERIVED) {
      interpretation_status = InterpretationStatus.DERIVED;
    } else if (rec.epistemic_status === EpistemicStatus.INTERPRETIVE) {
      interpretation_status = InterpretationStatus.SPECULATIVE;
    } else {
      interpretation_status = InterpretationStatus.CANONICAL;
    }
  }

  const epistemic_status = rec.epistemic_status || 
    (interpretation_status === InterpretationStatus.CANONICAL ? EpistemicStatus.OBSERVED :
     interpretation_status === InterpretationStatus.DERIVED ? EpistemicStatus.DERIVED :
     EpistemicStatus.INTERPRETIVE);

  return {
    ...rec,
    interpretation_status,
    epistemic_status,
    derived_from: rec.derived_from || []
  };
}

export function hashClaims(claims: EdgeRecord[], _ignored_policy_hash: string = ""): string {
  const normalized = claims.map(c => normalizeRecord(c));
  const mGraph = build_multigraph_from_records(normalized);
  return compute_claims_hash(mGraph);
}

export function hashPolicy(policy: PolicyArtifact): string {
  const serialized = {
    policy_version: policy.policy_version,
    allowed_families: [...policy.allowed_families].sort(),
    restricted_scopes: [...policy.restricted_scopes].sort(),
    threshold: policy.required_confidence_threshold,
  };
  return hashString(deterministicStringify(serialized));
}

export function hashCompiler(compiler: CompilerIdentity): string {
  return compute_compiler_identity_hash(compiler);
}

export function hashGraph(graph: CanonicalGraph): string {
  const sortedNodes = [...graph.nodes].sort();
  const sortedEdges = [...graph.edges].sort((a, b) => a.edge_id.localeCompare(b.edge_id));
  return hashString(deterministicStringify({ nodes: sortedNodes, edges: sortedEdges }));
}

export function validatePolicyBinding(claim: EdgeRecord, activity: CompilationActivity): void {
  if (claim.policy_version !== activity.policy_version) {
    throw new PolicyBindingError(
      `Edge '${claim.edge_id}' declares policy '${claim.policy_version}', but compilation uses '${activity.policy_version}'.`
    );
  }
}

export class JubileeCompiler {
  public receipt_store: Record<string, TopologyReceipt> = {};
  public activity_store: Record<string, CompilationActivity> = {};

  public compile(
    claims: EdgeRecord[],
    policy: PolicyArtifact,
    compiler: CompilerIdentity,
    parentReceipts: string[] = []
  ): { graph: CanonicalGraph; activity: CompilationActivity; receipt: TopologyReceipt } {
    const policy_hash = hashPolicy(policy);
    const compiler_hash = hashCompiler(compiler);

    const validation_errors: string[] = [];
    const validClaims: EdgeRecord[] = [];
    const nodesSet = new Set<string>();

    for (const rawClaim of claims) {
      const claim = normalizeRecord(rawClaim);
      try {
        // Enforce claim-to-policy bindings
        const claimPolicyVersion = claim.declared_policy_version || claim.policy_version;
        if (claimPolicyVersion && claimPolicyVersion !== policy.policy_version) {
          throw new PolicyBindingError(
            `Edge '${claim.edge_id}' declares policy '${claimPolicyVersion}', but compilation uses '${policy.policy_version}'.`
          );
        }

        // Check if edge family is permitted
        if (!policy.allowed_families.includes(claim.family)) {
          throw new ValidationError(
            `Edge '${claim.edge_id}' uses forbidden family '${claim.family}'. Allowed: [${policy.allowed_families.join(", ")}]`
          );
        }

        // Check confidence threshold if specified
        if (claim.confidence !== null && claim.confidence < policy.required_confidence_threshold) {
          throw new ValidationError(
            `Edge '${claim.edge_id}' has confidence ${claim.confidence}, which is below the policy threshold of ${policy.required_confidence_threshold}.`
          );
        }

        nodesSet.add(claim.source);
        nodesSet.add(claim.target);
        validClaims.push(claim);

      } catch (err: any) {
        validation_errors.push(`${claim.edge_id}: ${err.message || String(err)}`);
      }
    }

    const claims_hash = hashClaims(claims, policy_hash);

    const activity_id = `act_${hashString(claims_hash + policy_hash + compiler_hash).substring(7, 17)}`;
    const activity: CompilationActivity = {
      activity_id,
      compiler_name: compiler.compiler_name,
      compiler_version: compiler.compiler_version,
      compiler_hash: compiler.compiler_hash,
      schema_version: "v3.2",
      policy_version: policy.policy_version,
      policy_hash,
      input_claims_hash: claims_hash,
      parent_receipts: parentReceipts,
      started_at: "2026-07-20T12:00:00Z",
      completed_at: "2026-07-20T12:00:01Z",
    };

    this.activity_store[activity_id] = activity;

    const mGraph = build_multigraph_from_records(validClaims);

    const source_hashes: Record<string, string> = {};
    for (const claim of validClaims) {
      if (claim.source_path) {
        source_hashes[claim.source_path] = claim.source_hash;
      }
    }

    const { receipt: evalReceipt, breakdown } = evaluate_compilation_activity(
      mGraph,
      source_hashes,
      policy.policy_version,
      policy_hash,
      compiler,
      parentReceipts
    );

    const allErrors = [...validation_errors, ...evalReceipt.validation_errors];

    const graph: CanonicalGraph = {
      nodes: Array.from(nodesSet).sort(),
      edges: validClaims.map(c => ({
        edge_id: c.edge_id,
        source: c.source,
        target: c.target,
        family: c.family,
        claims_source: claims_hash,
      })),
    };

    const receipt: TopologyReceipt = {
      ...evalReceipt,
      activity_id,
      validation_passed: allErrors.length === 0,
      validation_errors: allErrors,
      feedback_summary: {
        dissent_count: breakdown[FeedbackKind.CROSS_FAMILY] + breakdown[FeedbackKind.REALIZATION],
        protest_hash: hashString("no_dissent_recorded")
      }
    };

    this.receipt_store[receipt.receipt_id] = receipt;

    return { graph, activity, receipt };
  }

  public verify_compilation_receipt(
    receipt: TopologyReceipt,
    claims: EdgeRecord[],
    policy: PolicyArtifact,
    compiler: CompilerIdentity
  ): {
    claims_match: boolean;
    policy_match: boolean;
    compiler_match: boolean;
    artifact_hashes_match: boolean;
    required_dag_checks_passed: boolean;
    parent_receipts_resolved: boolean;
    overall_valid: boolean;
  } {
    const claims_match = hashClaims(claims, receipt.policy_hash) === receipt.claims_hash;
    const policy_match = hashPolicy(policy) === receipt.policy_hash;
    const compiler_match = hashCompiler(compiler) === receipt.compiler_hash;

    const recompiled = this.compile(claims, policy, compiler, receipt.parent_receipts);
    const artifact_hashes_match = recompiled.receipt.canonical_hash === receipt.canonical_hash;

    const parent_receipts_resolved = receipt.parent_receipts.every(pid => !!this.receipt_store[pid]);
    const required_dag_checks_passed = receipt.validation_passed;

    const overall_valid =
      claims_match &&
      policy_match &&
      compiler_match &&
      artifact_hashes_match &&
      parent_receipts_resolved &&
      required_dag_checks_passed;

    return {
      claims_match,
      policy_match,
      compiler_match,
      artifact_hashes_match,
      required_dag_checks_passed,
      parent_receipts_resolved,
      overall_valid
    };
  }
}
