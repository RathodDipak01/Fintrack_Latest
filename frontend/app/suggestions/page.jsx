"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Zap, Target, Loader2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill } from "@/components/ui";
import { fintrackApi } from "@/lib/api";
import Link from "next/link";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const data = await fintrackApi.getAiSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="relative">
        <div className="absolute -top-20 -left-20 h-64 w-64 bg-ai/20 blur-[120px] rounded-full pointer-events-none" />
        
        <p className="text-xs font-black uppercase tracking-[0.3em] text-ai mb-2">
          AI Engine Alpha
        </p>
        <h1 className="text-4xl font-black text-white md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
          Smart Suggestions
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg leading-relaxed">
          Our quant models have scanned the Indian markets to identify high-conviction opportunities based on volatility, volume, and sentiment.
        </p>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-ai animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-warn animate-pulse" />
          </div>
          <p className="mt-6 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">
            Orchestrating Market Alpha...
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-12">
          {suggestions.map((item, idx) => (
            <GlassCard 
              key={item.symbol} 
              className="p-6 group hover:border-ai/40 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Target size={80} className="text-white" />
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white tracking-tighter">{item.symbol}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[150px]">
                    {item.name}
                  </span>
                </div>
                <Pill tone={item.tag === 'Risk' ? 'warn' : item.tag === 'Dividend' ? 'profit' : 'ai'}>
                  {item.tag}
                </Pill>
              </div>

              <div className="flex-1">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 group-hover:bg-white/[0.05] transition-colors">
                   <div className="flex items-center gap-2 mb-2">
                     <Zap size={14} className="text-warn fill-warn" />
                     <span className="text-[10px] font-black text-warn uppercase tracking-wider">AI INSIGHT</span>
                   </div>
                   <p className="text-sm text-slate-200 leading-relaxed font-medium italic">
                     "{item.aiTip}"
                   </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">CURRENT PRICE</span>
                  <span className="text-xl font-black text-white">₹{item.price?.toLocaleString('en-IN')}</span>
                </div>
                <div className={`text-right ${parseFloat(item.changePercent) >= 0 ? 'text-profit' : 'text-loss'}`}>
                   <span className="text-[10px] font-bold block mb-0.5 uppercase tracking-wider">24H CHANGE</span>
                   <span className="text-lg font-black flex items-center gap-1 justify-end">
                     {parseFloat(item.changePercent) >= 0 ? <TrendingUp size={16} /> : null}
                     {item.changePercent}%
                   </span>
                </div>
              </div>
              
              <Link 
                href={`/stocks?symbol=${item.symbol}`}
                className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white uppercase tracking-widest text-center hover:bg-ai hover:border-ai transition-all group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
              >
                Deep Analysis <ArrowRight size={14} />
              </Link>
            </GlassCard>
          ))}
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="mt-12 p-8 rounded-[32px] bg-gradient-to-br from-ai/10 to-transparent border border-white/5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-20 w-20 rounded-full bg-ai/20 flex items-center justify-center shrink-0">
               <Sparkles className="text-ai h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-2">How these are generated?</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                These suggestions are orchestrated by a multi-agent AI system that synthesizes live market order flow, global economic news, and technical indicators. We cross-reference **Yahoo Finance Trending Data** with real-time **Google News** analysis to provide you with actionable market alpha.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
