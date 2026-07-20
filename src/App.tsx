import React, { useState, useEffect } from "react";
import { VMPlayground } from "./components/VMPlayground";
import { ClusterExplorer } from "./components/ClusterExplorer";
import { CorpusTimeline } from "./components/CorpusTimeline";
import { RepositoryBrowser } from "./components/RepositoryBrowser";
import { Terminal, Shield, Network, BookOpen, Code, Github, ExternalLink, Calendar } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"vm" | "cluster" | "corpus" | "code">("vm");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Sync to user UTC or local time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* Sovereignty / Telemetry Top Bar */}
      <div className="bg-slate-950/80 border-b border-slate-900 py-2.5 px-6 sticky top-0 backdrop-blur-md z-50 flex flex-wrap gap-4 justify-between items-center text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CLUSTER_STATUS: CONNECTED
          </span>
          <span className="text-slate-600">|</span>
          <span>STABILITY_METRIC: 1.00</span>
          <span className="text-slate-600">|</span>
          <span>PORT: 3000</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {currentTime || "2026-07-20 12:56 UTC"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded uppercase text-[10px] font-bold">
            SOVEREIGNTY_CHECK: INTACT
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Jubilee v3.2.4
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl tracking-tight text-slate-100 flex items-center gap-2">
              JUBILEE VM PLAYGROUND
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              A formal, deterministic, non-erasure graph engine for the Jubilee-Engine-VM. 
              Executes stable multi-graph compilation, projects execution and ontology DAGs, and certifies structural stability using Standalone Verifier receipts and the v3.2.4 Reproducibility standard.
            </p>
          </div>
          
          <div className="flex gap-2.5">
            <a
              href="https://github.com/the-static-collective/Jubilee-Engine-VM"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Github className="w-4 h-4 text-slate-400" />
              Repository
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </header>

        {/* Tab Nav Selector */}
        <nav className="flex flex-wrap gap-2 border-b border-slate-900 pb-4">
          <button
            onClick={() => setActiveTab("vm")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
              activeTab === "vm"
                ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-400"
                : "bg-slate-900/30 border border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            VM Simulator Playground
          </button>
          <button
            onClick={() => setActiveTab("cluster")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
              activeTab === "cluster"
                ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-400"
                : "bg-slate-900/30 border border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-4 h-4" />
            Autodisco Garden Cluster
          </button>
          <button
            onClick={() => setActiveTab("corpus")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
              activeTab === "corpus"
                ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-400"
                : "bg-slate-900/30 border border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Symbolic Corpus Timeline
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
              activeTab === "code"
                ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-400"
                : "bg-slate-900/30 border border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-4 h-4" />
            Python Reference Core (v3.2.4)
          </button>
        </nav>

        {/* Tab Content rendering wrapper */}
        <section className="flex-1 min-h-0">
          {activeTab === "vm" && <VMPlayground />}
          {activeTab === "cluster" && <ClusterExplorer />}
          {activeTab === "corpus" && <CorpusTimeline />}
          {activeTab === "code" && <RepositoryBrowser />}
        </section>

      </main>

      {/* Footer credit */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <div>Jubilee VM Playground is a sandbox demonstration of non-erasure transformed-state protocols.</div>
        <div className="mt-1 opacity-75">Crafted with high-contrast displays, mono alignment, and sovereign isolation.</div>
      </footer>

    </div>
  );
}
