export interface ClusterNode {
  nodeId: string;
  displayName: string;
  version: string;
  description: string;
  baseUrl: string;
  health: "READY" | "DEGRADED" | "OFFLINE";
  gardenRoles: string[];
  capabilities: {
    id: string;
    label: string;
    description: string;
    inputSchemaUrl: string;
    commandUrl: string;
    outputReceiptTypes: string[];
    requiresConfirmation: boolean;
    actorRoles: string[];
    status: "AVAILABLE" | "LEFT_OPEN" | "DEGRADED" | "RETIRED";
  }[];
  receiptTypes: string[];
  updatedAt: string;
  privacy: {
    privateTablesExposed: boolean;
    crossNodeWritesAllowed: boolean;
  };
}

export const clusterNodes: ClusterNode[] = [
  {
    nodeId: "tranch-node",
    displayName: "tranchNode",
    version: "0.1.0",
    description: "Append-only witness receipts, hashes, and deterministic temporal order.",
    baseUrl: "http://localhost:4101",
    health: "READY",
    gardenRoles: ["ROOT"],
    privacy: { privateTablesExposed: false, crossNodeWritesAllowed: false },
    updatedAt: "2026-07-20T12:00:00Z",
    capabilities: [
      {
        id: "ledger.receipt.trace",
        label: "Trace receipt lineage",
        description: "Retrieve published ancestry, signatures, and parent-child witness lines.",
        inputSchemaUrl: "http://localhost:4101/schemas/trace-input.json",
        commandUrl: "http://localhost:4101/v1/receipts/trace",
        outputReceiptTypes: ["RECEIPT_TRACE_RETRIEVED"],
        requiresConfirmation: false,
        actorRoles: ["newcomer", "steward", "contestant"],
        status: "AVAILABLE"
      }
    ],
    receiptTypes: ["RECEIPT_APPENDED", "RECEIPT_TRACE_RETRIEVED"]
  },
  {
    nodeId: "recurv-repair",
    displayName: "reCURVrePAIR",
    version: "0.1.0",
    description: "Ecology repair, compost proposals, structured dissent, and memorials.",
    baseUrl: "http://localhost:4102",
    health: "READY",
    gardenRoles: ["COMPOST", "MONUMENT"],
    privacy: { privateTablesExposed: false, crossNodeWritesAllowed: false },
    updatedAt: "2026-07-20T12:00:00Z",
    capabilities: [
      {
        id: "ecology.compost.propose",
        label: "Propose Compost",
        description: "Transform future ecological treatments without erasing historical access.",
        inputSchemaUrl: "http://localhost:4102/schemas/compost-proposal.json",
        commandUrl: "http://localhost:4102/v1/compost-proposals",
        outputReceiptTypes: ["COMPOST_PROPOSED", "DISSENT_WINDOW_OPENED"],
        requiresConfirmation: true,
        actorRoles: ["newcomer", "steward"],
        status: "AVAILABLE"
      },
      {
        id: "ecology.dissent.record",
        label: "Record Dissent",
        description: "Attach clear contestation to any active proposal without removing or hiding it.",
        inputSchemaUrl: "http://localhost:4102/schemas/dissent.json",
        commandUrl: "http://localhost:4102/v1/dissent",
        outputReceiptTypes: ["DISSENT_RECORDED"],
        requiresConfirmation: true,
        actorRoles: ["newcomer", "steward", "contestant"],
        status: "AVAILABLE"
      }
    ],
    receiptTypes: [
      "AFFORDANCE_SCAR_RECORDED",
      "AFFORDANCE_REPAIR_RECORDED",
      "COMPOST_PROPOSED",
      "DISSENT_WINDOW_OPENED",
      "DISSENT_RECORDED"
    ]
  },
  {
    nodeId: "succession-node",
    displayName: "reMIX-reCURVrePAIR",
    version: "0.1.0",
    description: "Transformative succession, descendant lineages, and BUILD_BESIDE structures.",
    baseUrl: "http://localhost:4103",
    health: "READY",
    gardenRoles: ["MYCELIUM", "FLOWER"],
    privacy: { privateTablesExposed: false, crossNodeWritesAllowed: false },
    updatedAt: "2026-07-20T12:00:00Z",
    capabilities: [
      {
        id: "succession.build-beside.propose",
        label: "Build Beside",
        description: "Propose a descendant relation that gracefully preserves ancestor lineage.",
        inputSchemaUrl: "http://localhost:4103/schemas/build-beside.json",
        commandUrl: "http://localhost:4103/v1/build-beside-proposals",
        outputReceiptTypes: ["BUILD_BESIDE_PROPOSED"],
        requiresConfirmation: true,
        actorRoles: ["newcomer", "steward", "contestant"],
        status: "LEFT_OPEN"
      }
    ],
    receiptTypes: ["DESCENDANT_PROPOSAL_SEEDED", "BUILD_BESIDE_PROPOSED"]
  },
  {
    nodeId: "lamppost",
    displayName: "LampPost",
    version: "0.1.0",
    description: "Germination bed for initial seeds, unclosed questions, and potentialities.",
    baseUrl: "http://localhost:4104",
    health: "READY",
    gardenRoles: ["SEED"],
    privacy: { privateTablesExposed: false, crossNodeWritesAllowed: false },
    updatedAt: "2026-07-20T12:00:00Z",
    capabilities: [
      {
        id: "germination.seed.record",
        label: "Plant a Seed",
        description: "Record a new possibility without treating it as settled governance.",
        inputSchemaUrl: "http://localhost:4104/schemas/seed.json",
        commandUrl: "http://localhost:4104/v1/seeds",
        outputReceiptTypes: ["SEED_PLANTED"],
        requiresConfirmation: true,
        actorRoles: ["newcomer", "steward", "contestant"],
        status: "AVAILABLE"
      }
    ],
    receiptTypes: ["SEED_PLANTED", "QUESTION_LEFT_OPEN"]
  },
  {
    nodeId: "bananadash",
    displayName: "Bananadash",
    version: "0.1.0",
    description: "Read-only legibility layer representing receipts, capabilities, and weather.",
    baseUrl: "http://localhost:4105",
    health: "READY",
    gardenRoles: ["WEATHER", "FLOWER"],
    privacy: { privateTablesExposed: false, crossNodeWritesAllowed: false },
    updatedAt: "2026-07-20T12:00:00Z",
    capabilities: [
      {
        id: "weather.ecology.read",
        label: "Read Garden Weather",
        description: "Render derived observations with declared windows and witness references.",
        inputSchemaUrl: "http://localhost:4105/schemas/weather-query.json",
        commandUrl: "http://localhost:4105/v1/weather",
        outputReceiptTypes: ["WEATHER_READING_RENDERED"],
        requiresConfirmation: false,
        actorRoles: ["newcomer", "steward", "contestant"],
        status: "AVAILABLE"
      }
    ],
    receiptTypes: ["WEATHER_READING_RENDERED"]
  },
  {
    nodeId: "cluster-gateway",
    displayName: "Autodisco Chat Gateway",
    version: "0.1.0",
    description: "Sovereign manifest discovery, conversational routing, and epistemic disclosure.",
    baseUrl: "http://localhost:4100",
    health: "READY",
    gardenRoles: ["PATH"],
    privacy: { privateTablesExposed: false, crossNodeWritesAllowed: false },
    updatedAt: "2026-07-20T12:00:00Z",
    capabilities: [
      {
        id: "cluster.capabilities.list",
        label: "What can I do here?",
        description: "Aggregate declared capabilities dynamically from active node manifests.",
        inputSchemaUrl: "http://localhost:4100/schemas/capability-query.json",
        commandUrl: "http://localhost:4100/v1/capabilities",
        outputReceiptTypes: ["CAPABILITIES_DISCOVERED"],
        requiresConfirmation: false,
        actorRoles: ["newcomer", "steward", "contestant"],
        status: "AVAILABLE"
      }
    ],
    receiptTypes: ["CAPABILITIES_DISCOVERED", "ROUTING_DECISION_DISCLOSED"]
  }
];

export interface WeatherReading {
  element: string;
  status: "PROPOSED" | "ACTIVE" | "LEFT_OPEN" | "RETIRED";
  declaredBy: string;
  declaredAt: string;
  sourceReceiptId: string;
  metricLabel: string;
  metricValue: string;
}

export const initialWeather: WeatherReading[] = [
  {
    element: "SEED",
    status: "ACTIVE",
    declaredBy: "lamppost",
    declaredAt: "2026-07-20T08:15:00Z",
    sourceReceiptId: "wit_0012_abc321",
    metricLabel: "Germination rate",
    metricValue: "92%"
  },
  {
    element: "COMPOST",
    status: "PROPOSED",
    declaredBy: "recurv-repair",
    declaredAt: "2026-07-20T10:45:00Z",
    sourceReceiptId: "wit_0045_fe9a8b",
    metricLabel: "Dissent Window",
    metricValue: "Open (24h left)"
  },
  {
    element: "MYCELIUM",
    status: "LEFT_OPEN",
    declaredBy: "succession-node",
    declaredAt: "2026-07-20T11:30:00Z",
    sourceReceiptId: "wit_0067_f8a3d1",
    metricLabel: "Lineage overlap",
    metricValue: "0.85"
  },
  {
    element: "MONUMENT",
    status: "ACTIVE",
    declaredBy: "recurv-repair",
    declaredAt: "2026-07-19T14:20:00Z",
    sourceReceiptId: "wit_0008_d103b4",
    metricLabel: "Access restore count",
    metricValue: "49 repairs"
  }
];
