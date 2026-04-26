"use client";

import { useEffect, useState, useMemo } from "react";
import { BrainCircuit, ShieldAlert, Sparkles, Search, Loader2 } from "lucide-react";
import { ForecastChart } from "@/components/charts";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { alerts, holdings } from "@/lib/portfolio-data";
import { GeminiAdvisor } from "@/components/ai-advisor";
import { fintrackApi } from "@/lib/api";

export default function AiInsightsPage() {
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [liveHoldings, setLiveHoldings] = useState([]);
  const [signals, setSignals] = useState([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [isLoadingSignal, setIsLoadingSignal] = useState(false);

  useEffect(() => {
    fintrackApi.getSummary().then(setPortfolioSummary).catch(() => null);
    fintrackApi.getHoldings().then(setLiveHoldings).catch(() => null);
    fintrackApi.getSavedSignals().then(setSignals).catch(() => null);
  }, []);

  const handleAddSignal = async () => {
    if (!newSymbol) return;
    setIsLoadingSignal(true);
    try {
      const data = await fintrackApi.getAiSignal(newSymbol);
      if (data) {
        setSignals(prev => {
          const filtered = prev.filter(s => s.symbol !== data.symbol);
          return [data, ...filtered];
        });
        setNewSymbol("");
      }
    } catch (error) {
      console.error("Failed to fetch signal", error);
      alert(error.message || "Failed to generate signal. Check if the symbol is valid.");
    } finally {
      setIsLoadingSignal(false);
    }
  };

  const displayHoldings = liveHoldings.length > 0 ? liveHoldings : holdings;

  const allocation = useMemo(() => {
    if (!displayHoldings.length) return [];
    const sectors = displayHoldings.reduce((acc, h) => {
      const val = h.qty * (h.currentPrice || h.avgCost || h.avg);
      acc[h.sector] = (acc[h.sector] || 0) + val;
      return acc;
    }, {});
    const total = Object.values(sectors).reduce((s, v) => s + v, 0);
    return Object.entries(sectors)
      .map(([name, value]) => ({ name, value: parseFloat(((value / total) * 100).toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [displayHoldings]);

  const getMarketCap = (symbol) => {
    const s = symbol.toUpperCase().split('.')[0];
    const largeCaps = ["ADANIENT", "ADANIGREEN", "TCS", "HDFCBANK", "RELIANCE", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "BAJFINANCE", "MARUTI", "SUNPHARMA", "KOTAKBANK", "AXISBANK", "ONGC", "NTPC", "TATAMOTORS", "POWERGRID", "ASIANPAINT", "HCLTECH"];
    return largeCaps.includes(s) ? "Large cap" : 
           ["CHOLAFIN", "DIVISLAB", "LTIM", "TVSMOTOR", "DLF", "EICHERMOT", "BAJAJ_AUTO", "TATASTEEL", "CONCOR"].includes(s) ? "Mid cap" : "Small cap";
  };

  const marketCapAllocation = useMemo(() => {
    if (!displayHoldings.length) return [];
    const capGroups = displayHoldings.reduce((acc, h) => {
      const val = h.qty * (h.currentPrice || h.avgCost || h.avg);
      const cap = getMarketCap(h.symbol);
      acc[cap] = (acc[cap] || 0) + val;
      return acc;
    }, {});
    const totalValue = Object.values(capGroups).reduce((s,v) => s+v, 0);
    const order = ["Large cap", "Mid cap", "Small cap"];
    return Object.entries(capGroups).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(2))
    })).sort((a,b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [displayHoldings]);

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          AI Insights
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          Risk, signals and forecast
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Gemini-ready recommendations, concentration warnings and signal
          confidence for beginner and intermediate investors.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="AI Risk"
            title="Volatility + diversification score"
            action={<BrainCircuit className="text-ai" />}
          />
          <div className="relative mx-auto grid h-56 w-56 place-items-center rounded-full border-[18px] border-ai/20 bg-white/[0.035]">
            <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-r-warn border-t-profit" />
            <div className="text-center">
              <p className="text-5xl font-bold text-white">62</p>
              <p className="mt-1 text-sm text-slate-400">Medium risk</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Forecast"
            title="Prophet-style growth projection"
          />
          <ForecastChart />
        </GlassCard>
      </section>

      <GeminiAdvisor 
        holdings={displayHoldings}
        allocation={allocation}
        marketCapAllocation={marketCapAllocation}
        summary={portfolioSummary}
      />

      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Signals"
          title="Recommendation stance and confidence"
        />
        
        <div className="mb-6 flex items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Enter stock symbol (e.g. TCS)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-ai focus:outline-none focus:ring-1 focus:ring-ai uppercase"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSymbol) handleAddSignal();
              }}
            />
          </div>
          <button 
            onClick={handleAddSignal}
            disabled={!newSymbol || isLoadingSignal}
            className="flex items-center gap-2 rounded-md bg-ai px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-ai/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingSignal ? <Loader2 size={16} className="animate-spin" /> : "Get Signal"}
          </button>
        </div>

        {signals.length === 0 && !isLoadingSignal && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center text-slate-500 text-sm">
            Enter a stock symbol above to generate a real-time AI signal based on latest news.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {signals.map((signal) => (
            <div
              key={signal.symbol}
              className="rounded-lg border border-white/10 bg-white/[0.035] p-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <strong className="text-white">{signal.symbol}</strong>
                <Pill tone={signal.signal === "Bearish" ? "loss" : signal.signal === "Neutral" ? "warn" : "profit"}>
                  {signal.signal}
                </Pill>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${signal.signal === "Bearish" ? "bg-loss" : signal.signal === "Neutral" ? "bg-warn" : "bg-profit"}`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                {signal.confidence}% confidence
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {signal.note}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Warnings"
          title="What needs attention"
          action={<ShieldAlert className="text-warn" />}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
            >
              <Pill tone={alert.tone}>{alert.type}</Pill>
              <p className="mt-4 font-semibold text-white">{alert.title}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
