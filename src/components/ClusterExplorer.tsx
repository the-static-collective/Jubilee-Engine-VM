import React, { useState } from "react";
import { clusterNodes, initialWeather, ClusterNode, WeatherReading } from "../data/cluster";
import { Network, Server, FileJson, AlertCircle, Compass, RefreshCw, Send, Check } from "lucide-react";

export function ClusterExplorer() {
  const [selectedNode, setSelectedNode] = useState<ClusterNode>(clusterNodes[1]); // defaults to reCURVrePAIR
  const [activeWeather, setActiveWeather] = useState<WeatherReading[]>(initialWeather);
  const [cliInput, setActiveCliInput] = useState("");
  const [cliResponses, setCliResponses] = useState<string[]>([
    "System initialized. Type 'What can I do here?' to scan federated cluster capabilities."
  ]);
  const [showManifest, setShowManifest] = useState(true);

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const query = cliInput.trim().toLowerCase();
    let response = "";

    if (query.includes("what can i do here") || query.includes("capabilities") || query.includes("help")) {
      response = "Discovered 6 capabilities across 6 sovereign nodes:\n" +
        "1. ledger.receipt.trace [tranchNode] - Retrieve published ancestry\n" +
        "2. ecology.compost.propose [reCURVrePAIR] - Transform ecological treatment\n" +
        "3. ecology.dissent.record [reCURVrePAIR] - Attach contestation to any active proposal\n" +
        "4. succession.build-beside.propose [reMIX-reCURVrePAIR] - Propose descendant relation (STATUS: LEFT_OPEN)\n" +
        "5. germination.seed.record [LampPost] - Record new unclosed seed possibility\n" +
        "6. weather.ecology.read [Bananadash] - Render derived observations with declared windows";
    } else if (query.includes("weather") || query.includes("ecology")) {
      response = `Active Ecological Weather:\n` +
        `- SEED (Active) declared by LampPost: Germination rate is 92%\n` +
        `- COMPOST (Proposed) declared by reCURVrePAIR: Dissent Window is Open (24h left)\n` +
        `- MYCELIUM (Left Open) declared by succession-node: Lineage overlap is 0.85\n` +
        `- MONUMENT (Active) declared by reCURVrePAIR: Access restore count is 49 repairs`;
    } else if (query.includes("manifest")) {
      response = `Querying manifest of node [${selectedNode.displayName}]...\n` +
        `Version: ${selectedNode.version}\n` +
        `Role: ${selectedNode.gardenRoles.join(", ")}\n` +
        `Privacy: privateTablesExposed=${selectedNode.privacy.privateTablesExposed}, crossNodeWritesAllowed=${selectedNode.privacy.crossNodeWritesAllowed}`;
    } else {
      response = `Command unrecognized: "${cliInput}". Try typing "What can I do here?" or "weather".`;
    }

    setCliResponses(prev => [...prev, `> ${cliInput}`, response]);
    setActiveCliInput("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-display font-semibold text-xl text-slate-100 mb-2 flex items-center gap-2">
          <Network className="text-emerald-500 w-5.5 h-5.5" />
          Autodisco Garden Cluster & Bananadash
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          No monolithic databases or hidden shared states. The cluster runs on **federated sovereignty**: independent nodes exchange receipt ledger files and manifests through a structured JSON protocol, validated locally. 
          Legibility is maintained through **Bananadash** weather streams and the **Conversational Chat Gateway**.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Node Grid Maps */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="font-display font-semibold text-sm text-slate-100 mb-3 flex items-center gap-1.5">
              <Server className="text-slate-400 w-4 h-4" />
              Sovereign Node Network
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {clusterNodes.map((node) => (
                <button
                  key={node.nodeId}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                    selectedNode.nodeId === node.nodeId
                      ? "bg-emerald-950/30 border-emerald-500 shadow-md scale-[1.01]"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[9px] text-slate-500">v{node.version}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      node.health === "READY" ? "bg-emerald-400" : "bg-amber-400"
                    }`} />
                  </div>
                  <div className="font-display font-semibold text-xs text-slate-200 line-clamp-1">
                    {node.displayName}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1.5 uppercase font-mono">
                    {node.gardenRoles.join(", ")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat/Command Gateway */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 min-h-[250px]">
            <h4 className="font-display font-semibold text-sm text-slate-100 mb-2 flex items-center gap-1.5">
              <Compass className="text-slate-400 w-4 h-4" />
              Conversational PATH Gateway
            </h4>
            <div className="flex-1 bg-[#050811] rounded-lg p-3 font-mono text-[11px] leading-relaxed border border-slate-800 text-slate-300 overflow-y-auto max-h-[180px] terminal-scroll flex flex-col gap-2">
              {cliResponses.map((res, idx) => (
                <div key={idx} className={res.startsWith(">") ? "text-emerald-400 font-bold" : "text-slate-300 whitespace-pre-line"}>
                  {res}
                </div>
              ))}
            </div>
            <form onSubmit={handleCliSubmit} className="flex gap-2 mt-3">
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setActiveCliInput(e.target.value)}
                placeholder="Ask: 'What can I do here?'..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Manifest Inspector or Weather Reading */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowManifest(true)}
                  className={`text-xs font-semibold py-1 border-b-2 cursor-pointer transition-colors ${
                    showManifest
                      ? "text-emerald-400 border-emerald-500"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  Sovereign Manifest Inspector
                </button>
                <button
                  onClick={() => setShowManifest(false)}
                  className={`text-xs font-semibold py-1 border-b-2 cursor-pointer transition-colors ${
                    !showManifest
                      ? "text-emerald-400 border-emerald-500"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  Ecology Weather readings
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                DISCLOSED LOCAL PORT: 3000
              </div>
            </div>

            {showManifest ? (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-display font-semibold text-slate-200 text-sm">
                      {selectedNode.displayName} (/.well-known/autodisco-node.json)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30">
                    <Check className="w-3.5 h-3.5" />
                    Sovereign Boundary Intact
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {/* JSON Manifest Code block */}
                  <div className="rounded-lg border border-slate-800 bg-[#060a12] p-4 overflow-y-auto max-h-[300px] terminal-scroll">
                    <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre">
                      {JSON.stringify(
                        {
                          protocolVersion: "0.1",
                          nodeId: selectedNode.nodeId,
                          displayName: selectedNode.displayName,
                          version: selectedNode.version,
                          health: selectedNode.health,
                          gardenRoles: selectedNode.gardenRoles,
                          capabilities: selectedNode.capabilities.map(cap => ({
                            id: cap.id,
                            label: cap.label,
                            status: cap.status,
                            requiresConfirmation: cap.requiresConfirmation
                          })),
                          receiptTypes: selectedNode.receiptTypes,
                          privacy: selectedNode.privacy,
                          updatedAt: selectedNode.updatedAt
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  {/* Capabilities List Details */}
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] text-slate-500 font-bold font-mono">ADVERTISED CAPABILITIES</h5>
                    {selectedNode.capabilities.map(cap => (
                      <div key={cap.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">{cap.id}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            cap.status === "AVAILABLE" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" : "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                          }`}>
                            {cap.status}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200">{cap.label}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{cap.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                            Roles: {cap.actorRoles.join(", ")}
                          </span>
                          {cap.requiresConfirmation && (
                            <span className="text-[9px] font-mono bg-amber-950/10 border border-amber-900/30 px-1.5 py-0.5 rounded text-amber-500">
                              Requires Confirmation
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Weather readings view (Bananadash ecology representation)
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h4 className="font-display font-semibold text-slate-200 text-sm">
                      Bananadash Legibility Stream
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Surfacing active and proposed garden states without database centralization.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeWeather.map((item) => (
                    <div key={item.element} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30 font-bold uppercase tracking-wider">
                            {item.element}
                          </span>
                          <span className="font-mono text-[9px] text-slate-500 block mt-1">
                            SOURCE RECEIPT
                          </span>
                          <span className="font-mono text-[10px] text-slate-300">
                            {item.sourceReceiptId}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30"
                            : item.status === "PROPOSED"
                            ? "bg-amber-950/50 text-amber-400 border border-amber-900/30"
                            : "bg-purple-950/50 text-purple-400 border border-purple-900/30"
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="border-t border-slate-900 pt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">DECLARED BY</span>
                          <span className="font-semibold text-slate-300">{item.declaredBy}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">{item.metricLabel}</span>
                          <span className="font-semibold text-emerald-400">{item.metricValue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
