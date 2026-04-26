"use client";

import { useState } from "react";
import { Sparkles, BrainCircuit } from "lucide-react";
import { GlassCard, Pill, SectionHeader } from "./ui";
import { fintrackApi } from "@/lib/api";

export function GeminiAdvisor({ holdings, allocation, marketCapAllocation, summary }) {
  const [riskAppetite, setRiskAppetite] = useState("Medium");
  const [horizon, setHorizon] = useState("Medium Term");
  const [analysis, setAnalysis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [source, setSource] = useState("");

  const generateDeepAnalysis = async () => {
    setIsGenerating(true);
    setAnalysis("");
    try {
      const data = await fintrackApi.generateAiInsights({
        holdings,
        allocation,
        marketCapAllocation,
        summary,
        riskAppetite,
        horizon
      });
      
      if (data) {
        setAnalysis(data.analysis || (Array.isArray(data.insights) ? data.insights.join("\n\n") : ""));
        setSource(data.source || "mock");
      }
    } catch (err) {
      setAnalysis(`**Error:** Failed to connect to AI engine. \n\nDetails: ${err.message}. \n\nPlease ensure your backend is running.`);
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
          <h3 key={i} className="mt-8 mb-4 text-xl font-bold text-white flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai text-sm shadow-glow">{sectionMatch[1]}</span>
            <span className="border-b-2 border-ai/30 pb-1">{sectionMatch[2]}</span>
          </h3>
        );
      }

      // 2. Markdown Headers (### Header)
      if (trimmedLine.startsWith("###")) {
        return <h4 key={i} className="mt-6 mb-3 text-lg font-bold text-ai uppercase tracking-widest">{trimmedLine.replace(/^#+\s*/, "")}</h4>;
      }

      // 3. List Items (Removing the actual star/dash symbol as requested)
      const listMatch = trimmedLine.match(/^[\*\-\+]{1,2}\s*(.*)/);
      if (listMatch) {
        const content = listMatch[1];
        return (
          <div key={i} className="ml-4 mb-4 flex gap-4 text-sm text-slate-300">
            {/* Using a cleaner line-based indicator instead of a star */}
            <span className="w-1 h-auto bg-ai/30 rounded-full shrink-0" />
            <span className="leading-relaxed py-0.5">
              {renderFormattedLine(content)}
            </span>
          </div>
        );
      }

      // 4. Standalone Bold headers or sub-sections
      if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
        return <p key={i} className="mt-6 mb-3 text-sm font-bold text-white uppercase tracking-wider">{trimmedLine.replace(/\*\*/g, "")}</p>;
      }

      // 5. Default Paragraph with inline bolding support
      return (
        <p key={i} className="mb-4 text-sm leading-8 text-slate-400">
          {renderFormattedLine(line)}
        </p>
      );
    });
  };

  // Helper to handle inline bolding (**text**)
  const renderFormattedLine = (line) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pi} className="text-white font-semibold">{part.replace(/\*\*/g, "")}</strong>;
      }
      return part;
    });
  };

  return (
    <GlassCard className="p-6">
      <SectionHeader
        eyebrow="Gemini AI"
        title="Portfolio Strategy Assistant"
        action={
          <Pill tone={source === "gemini" ? "profit" : source === "mock" ? "warn" : source === "error" ? "loss" : "ai"}>
            {source === "gemini" ? "Advanced Mode" : source === "mock" ? "Mock Mode" : source === "error" ? "Connection Error" : "AI Ready"}
          </Pill>
        }
      />
      
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Risk Appetite</label>
            <div className="flex flex-col gap-2">
              {["Low", "Medium", "High"].map(level => (
                <button
                  key={level}
                  onClick={() => setRiskAppetite(level)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${riskAppetite === level ? "bg-ai text-white shadow-glow" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                >
                  {level} Risk
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Investment Horizon</label>
            <div className="flex flex-col gap-2">
              {["Short Term", "Medium Term", "Long Term"].map(term => (
                <button
                  key={term}
                  onClick={() => setHorizon(term)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${horizon === term ? "bg-ai text-white shadow-glow" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateDeepAnalysis}
            disabled={isGenerating || !holdings?.length}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-md bg-ai px-4 py-3 font-bold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Sparkles size={18} />}
            Generate Analysis
          </button>
        </div>

        <div className="relative min-h-[400px] rounded-lg border border-white/10 bg-white/[0.035] p-6 group">
          {analysis && !isGenerating && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis);
                alert("Analysis copied to clipboard!");
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-md bg-white/5 text-slate-400 hover:bg-ai hover:text-white transition-all opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          )}

          <div className="h-full max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            {!analysis && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                <BrainCircuit size={48} className="mb-4 text-ai" />
                <p className="text-sm">Select your preferences and click "Generate Analysis" to get a deep portfolio audit from Gemini AI.</p>
              </div>
            ) : isGenerating ? (
              <div className="space-y-6 animate-pulse py-4">
                <div className="h-6 w-1/3 bg-white/10 rounded" />
                <div className="h-32 w-full bg-white/5 rounded" />
                <div className="h-6 w-1/4 bg-white/10 rounded" />
                <div className="h-48 w-full bg-white/5 rounded" />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                {formatText(analysis)}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
