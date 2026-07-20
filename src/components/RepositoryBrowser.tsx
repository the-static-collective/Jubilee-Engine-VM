import React, { useState } from "react";
import { codebaseFiles, CodeFile } from "../data/codebase";
import { runVMTestSuite, TestResult } from "../lib/testRunner";
import { Copy, Check, Play, FileCode, CheckCircle2, XCircle, Terminal } from "lucide-react";

export function RepositoryBrowser() {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(codebaseFiles[0]);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [activeLog, setActiveLog] = useState<string[]>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTests = () => {
    setTesting(true);
    setTestResults(null);
    setActiveLog(["$ pytest --verbose tests/"]);
    
    setTimeout(() => {
      setActiveLog(prev => [...prev, "============================= test session starts =============================="]);
    }, 400);

    setTimeout(() => {
      setActiveLog(prev => [...prev, "platform linux -- Python 3.11.2, pytest-7.2.1, pluggy-1.0.0 -- /usr/bin/python3"]);
      setActiveLog(prev => [...prev, "cachedir: .pytest_cache"]);
      setActiveLog(prev => [...prev, "metadata: {'Python': '3.11.2', 'Platform': 'Linux', 'Packages': {'pytest': '7.2.1'}}"]);
      setActiveLog(prev => [...prev, "rootdir: /workspace, configfile: pytest.ini"]);
    }, 900);

    setTimeout(() => {
      setActiveLog(prev => [...prev, "collected 8 items", ""]);
    }, 1400);

    // Run actual tests in mock
    const results = runVMTestSuite();

    let delay = 1900;
    results.forEach((test, idx) => {
      setTimeout(() => {
        const mark = test.status === "PASSED" ? "PASSED" : "FAILED";
        setActiveLog(prev => [
          ...prev,
          `${test.suite}::${test.name} ${mark}`
        ]);
        if (test.status === "FAILED" && test.error) {
          setActiveLog(prev => [...prev, `    ERROR: ${test.error}`]);
        }
      }, delay);
      delay += 300;
    });

    setTimeout(() => {
      setTestResults(results);
      setTesting(false);
      const passedCount = results.filter(r => r.status === "PASSED").length;
      const failedCount = results.filter(r => r.status === "FAILED").length;
      setActiveLog(prev => [
        ...prev,
        "",
        `======================= ${passedCount} passed, ${failedCount} failed in 1.42s =======================`
      ]);
    }, delay + 400);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* File Tree & Descriptions */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="font-display font-semibold text-lg text-slate-100 mb-3 flex items-center gap-2">
            <FileCode className="text-emerald-500 w-5 h-5" />
            Repository Files (v0.1.0)
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Browse the core Python specifications and tests of the non-erasure 6-primitive Jubilee VM kernel.
          </p>
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 terminal-scroll">
            {codebaseFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`text-left p-3 rounded-lg border text-xs transition-all ${
                  selectedFile.path === file.path
                    ? "bg-emerald-950/40 border-emerald-500/50 text-slate-100 font-medium"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <div className="font-mono text-emerald-400 mb-1">{file.path}</div>
                <div className="line-clamp-1 opacity-80">{file.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pytest Terminal Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 min-h-[300px]">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-display font-semibold text-slate-100 flex items-center gap-2 text-sm">
              <Terminal className="text-slate-400 w-4 h-4" />
              Interactive Pytest Suite
            </h4>
            <button
              onClick={handleRunTests}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {testing ? "Testing..." : "Run pytest"}
            </button>
          </div>
          <div className="flex-1 bg-[#050811] rounded-lg p-3 font-mono text-[11px] leading-relaxed border border-slate-800 text-slate-300 overflow-y-auto max-h-[250px] terminal-scroll flex flex-col gap-1">
            {activeLog.map((log, index) => {
              let color = "text-slate-400";
              if (log.startsWith("$")) color = "text-emerald-400 font-bold";
              else if (log.includes("PASSED")) color = "text-emerald-400 font-medium";
              else if (log.includes("FAILED") || log.includes("ERROR")) color = "text-rose-500 font-semibold";
              else if (log.startsWith("=====")) color = "text-slate-500";
              return (
                <div key={index} className={color}>
                  {log}
                </div>
              );
            })}
            {activeLog.length === 0 && (
              <div className="text-slate-500 italic text-center my-auto">
                Click "Run pytest" above to execute real-time validation checks.
              </div>
            )}
          </div>
          {testResults && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded p-2 text-emerald-400">
                <div className="font-mono text-lg font-bold">
                  {testResults.filter(r => r.status === "PASSED").length}
                </div>
                <div className="text-[10px] opacity-75">PASSED</div>
              </div>
              <div className="bg-rose-950/20 border border-rose-900/30 rounded p-2 text-rose-400">
                <div className="font-mono text-lg font-bold">
                  {testResults.filter(r => r.status === "FAILED").length}
                </div>
                <div className="text-[10px] opacity-75">FAILED</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <div>
              <div className="font-mono text-emerald-400 text-sm font-semibold">{selectedFile.path}</div>
              <div className="text-xs text-slate-400 mt-1">{selectedFile.description}</div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Copy File
                </>
              )}
            </button>
          </div>
          <div className="flex-1 rounded-lg border border-slate-800 bg-[#060a12] p-4 overflow-x-auto max-h-[500px] terminal-scroll">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre select-all">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
