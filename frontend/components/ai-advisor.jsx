"use client";

import { useState } from "react";
import { Sparkles, BrainCircuit, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard, Pill, SectionHeader } from "./ui";
import { fintrackApi } from "@/lib/api";

export function GeminiAdvisor({ holdings, allocation, marketCapAllocation, summary }) {
  const [riskAppetite, setRiskAppetite] = useState("Medium");
  const [horizon, setHorizon] = useState("Medium Term");
  const [analysis, setAnalysis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [source, setSource] = useState("");
  const [targetSymbol, setTargetSymbol] = useState(() => {
    if (!holdings?.length) return "";
    const top = [...holdings].sort((a, b) => {
      const valA = (a.qty || 0) * (a.price || a.avgCost || a.avg || 0);
      const valB = (b.qty || 0) * (b.price || b.avgCost || b.avg || 0);
      return valB - valA;
    })[0];
    return top.symbol;
  });


  const generateDeepAnalysis = async () => {
    setIsGenerating(true);
    setAnalysis("");
    try {
      if (!targetSymbol) {
        throw new Error("Please select a holding to analyze.");
      }
      
      const data = await fintrackApi.orchestrateMlStrategy(targetSymbol);
      
      if (data) {
        setAnalysis(`**[ML QUANTITATIVE AUDIT FOR: ${targetSymbol}]**\n\n` + (data.analysis || ""));
        setSource("gemini");
      }
    } catch (err) {
      setAnalysis(`**Error:** Failed to connect to AI engine. \n\nDetails: ${err.message}. \n\nPlease ensure your Python ML backend is running on Cloudflare/Localhost.`);

      setSource("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatText = (text) => {
    if (!text) return null;
    
    return text.split("\n").map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine && line === "") return <div key={i} className="h-4" />;
      
      // 1. Numbered Section Headers (e.g., 1. Key Insights)
      const sectionMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
      if (sectionMatch) {
        return (
          <h3 key={i} className="mt-10 mb-5 text-xl font-bold text-white flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ai to-ai/40 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white">{sectionMatch[1]}</span>
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{sectionMatch[2]}</span>
          </h3>
        );
      }

      // 2. Markdown Headers (### Header)
      if (trimmedLine.startsWith("###")) {
        return <h4 key={i} className="mt-8 mb-4 text-xs font-black text-ai uppercase tracking-[0.3em] opacity-80">{trimmedLine.replace(/^#+\s*/, "")}</h4>;
      }

      // 3. List Items
      const listMatch = trimmedLine.match(/^[\*\-\+]{1,2}\s*(.*)/);
      if (listMatch) {
        const content = listMatch[1];
        return (
          <div key={i} className="ml-2 mb-4 flex gap-4 text-sm text-slate-300">
            <span className="w-1.5 h-1.5 bg-ai/50 rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="leading-relaxed py-0.5">
              {renderFormattedLine(content)}
            </span>
          </div>
        );
      }

      // 4. Standalone Bold headers or sub-sections
      if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
        return <p key={i} className="mt-8 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-ai/30 pl-4">{trimmedLine.replace(/\*\*/g, "")}</p>;
      }

      // 5. Default Paragraph with inline bolding support
      return (
        <p key={i} className="mb-5 text-[15px] leading-8 text-slate-400/90 font-medium">
          {renderFormattedLine(line)}
        </p>
      );
    });
  };

  const renderFormattedLine = (line) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pi} className="text-white font-bold tracking-tight">{part.replace(/\*\*/g, "")}</strong>;
      }
      return part;
    });
  };

  return (
    <GlassCard className="p-0 overflow-hidden border-ai/10">
      <div className="bg-gradient-to-r from-ai/10 via-transparent to-transparent p-6 border-b border-white/5">
        <SectionHeader
          eyebrow="Gemini AI"
          title="Portfolio Strategy Assistant"
          action={
            <Pill tone={source === "gemini" ? "profit" : source === "mock" ? "warn" : source === "error" ? "loss" : "ai"}>
              {source === "gemini" ? "Advanced Mode" : source === "mock" ? "Simulation" : source === "error" ? "Engine Offline" : "System Ready"}
            </Pill>
          }
        />
      </div>
      
      <div className="grid lg:grid-cols-[340px_1fr]">
        {/* Controls Sidebar */}
        <div className="p-8 space-y-8 border-r border-white/5 bg-white/[0.01]">
          <div className="space-y-6">
            
            {/* Target Selection */}
            {holdings?.length > 0 && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 block">Target Asset</label>
                <select
                  value={targetSymbol}
                  onChange={(e) => setTargetSymbol(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-ai transition-colors"
                >
                  {holdings.map((h) => (
                    <option key={h.symbol} value={h.symbol}>
                      {h.symbol} ({h.qty} shares)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 block">Risk Appetite</label>

              <div className="grid grid-cols-1 gap-2">
                {["Low", "Medium", "High"].map(level => (
                  <button
                    key={level}
                    onClick={() => setRiskAppetite(level)}
                    className={`group relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-between overflow-hidden ${
                      riskAppetite === level 
                        ? "text-white" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="relative z-10">{level} Risk</span>
                    {riskAppetite === level && (
                      <motion.div 
                        layoutId="activeRisk"
                        className="absolute inset-0 bg-gradient-to-r from-ai to-ai/60"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {!riskAppetite === level && (
                      <div className="absolute inset-0 bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors" />
                    )}
                    {riskAppetite === level && <div className="h-1.5 w-1.5 rounded-full bg-white relative z-10 shadow-[0_0_8px_white]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 block">Investment Horizon</label>
              <div className="grid grid-cols-1 gap-2">
                {["Short Term", "Medium Term", "Long Term"].map(term => (
                  <button
                    key={term}
                    onClick={() => setHorizon(term)}
                    className={`group relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-between overflow-hidden ${
                      horizon === term 
                        ? "text-white" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="relative z-10">{term}</span>
                    {horizon === term && (
                      <motion.div 
                        layoutId="activeHorizon"
                        className="absolute inset-0 bg-gradient-to-r from-ai to-ai/60"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {!horizon === term && (
                      <div className="absolute inset-0 bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors" />
                    )}
                    {horizon === term && <div className="h-1.5 w-1.5 rounded-full bg-white relative z-10 shadow-[0_0_8px_white]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={generateDeepAnalysis}
              disabled={isGenerating || !holdings?.length}
              className="group relative w-full rounded-2xl p-[1px] overflow-hidden 
               bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500
               transition-all duration-300
               hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]
               disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {/* Inner content */}
              <div className="relative z-10 flex items-center justify-center gap-3 
                    rounded-2xl bg-slate-950 px-6 py-4
                    transition-all duration-300
                    group-hover:bg-slate-900">
                {isGenerating ? (
                  <Loader2 className="animate-spin text-white" size={20} />
                ) : (
                  <Sparkles
                    size={20}
                    className="text-blue-400 transition-colors duration-300 group-hover:text-white"
                  />
                )}

                <span className="text-base font-black text-white uppercase tracking-wider">
                  {isGenerating ? "Analyzing..." : "Generate Audit"}
                </span>
              </div>

              {/* Subtle animated border glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                              bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.6),transparent)]
                              animate-[spin_4s_linear_infinite]" />
            </button>

            {!holdings?.length && (
              <p className="mt-3 text-[10px] text-center text-slate-500 font-bold uppercase tracking-wider">
                Import portfolio to enable AI audit
              </p>
            )}
          </div>
        </div>

        {/* Analysis Output */}
        <div className="relative min-h-[500px] p-8 lg:p-12 bg-slate-950/20 group">
          {analysis && !isGenerating && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis);
                alert("Analysis copied to clipboard!");
              }}
              className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-ai hover:text-white hover:border-ai transition-all opacity-0 group-hover:opacity-100 uppercase tracking-widest"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy Report
            </button>
          )}

          <div className="h-full max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
            {!analysis && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="relative mb-8">
                  <div className="absolute inset-0 animate-ping rounded-full bg-ai/20" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-ai/10 border border-ai/30">
                    <BrainCircuit size={40} className="text-ai" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Intelligence Ready</h3>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed mx-auto font-medium">
                  Select your risk profile and horizon to receive a comprehensive audit powered by Gemini 2.5 Flash.
                </p>
              </div>
            ) : isGenerating ? (
              <div className="space-y-8 py-4 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-[90%] animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-[85%] animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-40 w-full animate-pulse rounded-2xl bg-white/[0.02]" />
                <div className="h-4 w-[70%] animate-pulse rounded bg-white/5" />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20 selection:bg-ai/30">
                {formatText(analysis)}
              </div>
            )}
          </div>
          
          {/* Decorative gradients */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none opacity-60" />
        </div>
      </div>
    </GlassCard>
  );
}
