import React, { useState } from "react";
import { BookOpen, RefreshCw, Layers, Compass, ArrowRightLeft } from "lucide-react";

interface Epoch {
  epoch: number;
  title: string;
  subtitle: string;
  sourceText: string;
  lemma: string;
  opcode: string;
  entropy: { spatial: number; semantic: number; functional: number; relational: number };
  description: string;
  mapping?: string;
  category: "Genesis (Forming)" | "Genesis (Filling)" | "John Prologue";
}

const epochs: Epoch[] = [
  {
    epoch: 0,
    title: "Epoch 0: Beginning",
    subtitle: "In the beginning...",
    sourceText: "בראשית ברא אלהים את השמים ואת הארץ",
    lemma: "B-R-A (Create)",
    opcode: "ANCHOR",
    entropy: { spatial: 1.0, semantic: 1.0, functional: 1.0, relational: 1.0 },
    description: "Transcendent anchor point. Absolute frame created out of non-existence. Spatial/relational maximum bounds initialized.",
    category: "Genesis (Forming)"
  },
  {
    epoch: 1,
    title: "Day 1: Light & Separation",
    subtitle: "Let there be light...",
    sourceText: "ויאמר אלהים יהי אור ויהי אור",
    lemma: "Separation / Division",
    opcode: "PARTITION / BIND",
    entropy: { spatial: 0.9, semantic: 0.8, functional: 1.0, relational: 1.0 },
    description: "Partitioning of absolute spectrum. light separated from darkness, bound to the Day/Night scope schema.",
    mapping: "Forming foundation for Day 4 filling.",
    category: "Genesis (Forming)"
  },
  {
    epoch: 2,
    title: "Day 2: Firmament Space",
    subtitle: "Divide the waters...",
    sourceText: "ויבדל בין המים אשר מתחת לרקיע",
    lemma: "Expansion",
    opcode: "PARTITION / BIND",
    entropy: { spatial: 0.7, semantic: 0.7, functional: 1.0, relational: 1.0 },
    description: "Creating a structural gap. Upper waters separated from lower waters. Establishes Sky/Water scopes.",
    mapping: "Forming foundation for Day 5 filling.",
    category: "Genesis (Forming)"
  },
  {
    epoch: 3,
    title: "Day 3: Dry Land & Veg",
    subtitle: "Let dry land appear...",
    sourceText: "ויקרא אלהים ליבשה ארץ",
    lemma: "Gathering / Accumulation",
    opcode: "PARTITION / POPULATE",
    entropy: { spatial: 0.55, semantic: 0.65, functional: 0.9, relational: 1.0 },
    description: "Waters gathered. Dry land emerges as terrestrial scope. Populated with vegetation (self-seeding loop).",
    mapping: "Forming foundation for Day 6 filling.",
    category: "Genesis (Forming)"
  },
  {
    epoch: 4,
    title: "Day 4: Luminaries",
    subtitle: "Lights in the expanse...",
    sourceText: "עשה אלהים את שני המארת הגדלים",
    lemma: "Rule / Governance",
    opcode: "POPULATE",
    entropy: { spatial: 0.55, semantic: 0.65, functional: 0.75, relational: 1.0 },
    description: "Luminaries populate the Day/Night scope formed on Day 1. Governs times, seasons, and cycles.",
    mapping: "Fills the Day 1 separation schema directly.",
    category: "Genesis (Filling)"
  },
  {
    epoch: 5,
    title: "Day 5: Sky & Water Life",
    subtitle: "Let swarm the waters...",
    sourceText: "ויברא אלהים את התנינם הגדלים",
    lemma: "Multiplication",
    opcode: "POPULATE",
    entropy: { spatial: 0.55, semantic: 0.65, functional: 0.6, relational: 0.95 },
    description: "Fishes populate the sea, birds swarm the sky. Fills the space scopes allocated on Day 2.",
    mapping: "Fills the Day 2 firmament schema directly.",
    category: "Genesis (Filling)"
  },
  {
    epoch: 6,
    title: "Day 6: Land Life & Humans",
    subtitle: "Let us make human...",
    sourceText: "ויברא אלהים את האדם בצלמו",
    lemma: "Subdue / Rule (Delegation)",
    opcode: "POPULATE / DELEGATE",
    entropy: { spatial: 0.55, semantic: 0.65, functional: 0.5, relational: 0.75 },
    description: "Humans populate the dry land from Day 3. Authority delegated to act inside the DryLand scope.",
    mapping: "Fills the Day 3 terrestrial schema directly.",
    category: "Genesis (Filling)"
  },
  {
    epoch: 10,
    title: "Epoch 10: The Logos Arche",
    subtitle: "In beginning was the Logos...",
    sourceText: "ἐν ἀρχῇ ἦν ὁ λόγος",
    lemma: "ARCHE (Import)",
    opcode: "IMPORT",
    entropy: { spatial: 0.55, semantic: 0.55, functional: 0.5, relational: 0.65 },
    description: "John Prologue. Imports the absolute Genesis anchor (G1_ANCHOR). Reframes all Genesis 'RESOLVE' commands through the Logos.",
    category: "John Prologue"
  },
  {
    epoch: 12,
    title: "Epoch 12: Encounter & RBAC",
    subtitle: "As many as received...",
    sourceText: "ὅσοι δὲ ἔλαβον αὐτόν... ἔδωκεν αὐτοῖς ἐξουσίαν",
    lemma: "EXOUSIA (Authority/Grant)",
    opcode: "ENCOUNTER / RECEIVE / GRANT",
    entropy: { spatial: 0.55, semantic: 0.55, functional: 0.5, relational: 0.45 },
    description: "Encounter with the world. Rejection by some, reception by others. Authority key granted to those who receive (Relational Entropy Reduction).",
    category: "John Prologue"
  },
  {
    epoch: 13,
    title: "Epoch 13: Incarnation Scope Collapse",
    subtitle: "And the Logos became flesh...",
    sourceText: "καὶ ὁ λόγος σὰρξ ἐγένετο καὶ ἐσκήνωσεν ἐν ἡμῖν",
    lemma: "SARX EGENETO",
    opcode: "INCARNATE",
    entropy: { spatial: 0.55, semantic: 0.4, functional: 0.4, relational: 0.3 },
    description: "Critical boundary-crossing hyperevent. The external compiler / sustaining principle enters its own created humanity namespace, collapsing the outside/inside graph distinction.",
    category: "John Prologue"
  }
];

export function CorpusTimeline() {
  const [selectedEpoch, setSelectedEpoch] = useState<Epoch>(epochs[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-display font-semibold text-xl text-slate-100 mb-2 flex items-center gap-2">
          <BookOpen className="text-emerald-500 w-5.5 h-5.5" />
          The Symbolic Test Corpus (Genesis & John)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Genesis, John, and Revelation transition paths represent a deeply interlinked symbolic stress-test for the Jubilee VM. 
          By mapping theological schemas to computational primitives, we test scope boundaries, namespace allocations, and state-history preservation on complex, non-erasure graphs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Epoch Interactive Timeline Line */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h4 className="font-display font-semibold text-sm text-slate-100 mb-4 flex items-center gap-2">
            <Layers className="text-slate-400 w-4.5 h-4.5" />
            Ecology & Epoch Timeline
          </h4>
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[450px] pr-1 terminal-scroll">
            {epochs.map((ep) => (
              <button
                key={ep.epoch + ep.title}
                onClick={() => setSelectedEpoch(ep)}
                className={`text-left p-3.5 rounded-lg border transition-all relative ${
                  selectedEpoch.title === ep.title
                    ? "bg-slate-950 border-emerald-500 text-slate-100 font-medium scale-[1.01] shadow-lg"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ep.category === "Genesis (Forming)"
                      ? "bg-slate-800 text-emerald-400"
                      : ep.category === "Genesis (Filling)"
                      ? "bg-slate-800 text-blue-400"
                      : "bg-purple-950/40 text-purple-400 border border-purple-900/30"
                  }`}>
                    {ep.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Epoch {ep.epoch}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mb-1">{ep.title}</div>
                <div className="font-serif italic text-[11px] text-slate-400 line-clamp-1">"{ep.subtitle}"</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Epoch Detailed Mappings */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider font-mono">
                  {selectedEpoch.category}
                </span>
                <h3 className="font-display font-semibold text-lg text-slate-100 mt-1">
                  {selectedEpoch.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono block">OPCODE</span>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded border border-amber-900/30">
                  {selectedEpoch.opcode}
                </span>
              </div>
            </div>

            {/* Hebrew/Greek Source & Lemma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-[#060a12] p-3 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono mb-1">ORIGINAL SOURCE TEXT</div>
                <div className="text-sm font-serif text-slate-200 leading-relaxed">
                  {selectedEpoch.sourceText}
                </div>
              </div>
              <div className="bg-[#060a12] p-3 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-500 font-mono mb-1">CANONICAL LEMMA</div>
                <div className="text-xs font-mono text-emerald-400 font-semibold">
                  {selectedEpoch.lemma}
                </div>
              </div>
            </div>

            {/* Interactive Entropy Meters */}
            <div className="bg-[#060a12] p-4 rounded-lg border border-slate-800 mb-5">
              <h5 className="font-display font-semibold text-xs text-slate-300 mb-3 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                Live State Entropy Metrics
              </h5>
              <div className="grid grid-cols-2 gap-4">
                {(["spatial", "semantic", "functional", "relational"] as const).map((key) => {
                  const val = selectedEpoch.entropy[key];
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-mono uppercase">
                        <span className="text-slate-400">{key}</span>
                        <span className="text-emerald-400">{val.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${val * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description and forming/filling mapping */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <h5 className="text-[10px] text-slate-500 font-bold font-mono mb-1">ARCHITECTURAL RATIONALE</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedEpoch.description}
                </p>
              </div>

              {selectedEpoch.mapping && (
                <div className="mt-auto bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 flex gap-3 items-center">
                  <ArrowRightLeft className="text-emerald-400 w-5 h-5 shrink-0" />
                  <div>
                    <h6 className="text-[10px] font-bold text-emerald-400 font-mono">FORMING / FILLING MAPPING</h6>
                    <p className="text-[11px] text-slate-300">
                      {selectedEpoch.mapping}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
