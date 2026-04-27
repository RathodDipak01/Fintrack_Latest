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

  const riskScoreData = useMemo(() => {
    if (!displayHoldings.length) return { score: 0, label: "N/A", tone: "neutral" };
    
    let score = 50; // Start at neutral
    
    // 1. Diversification adjustment
    if (displayHoldings.length > 10) score += 15;
    else if (displayHoldings.length > 5) score += 5;
    else score -= 15;

    // 2. Market Cap adjustment
    const smallCap = marketCapAllocation.find(c => c.name === "Small cap")?.value || 0;
    const largeCap = marketCapAllocation.find(c => c.name === "Large cap")?.value || 0;
    
    if (smallCap > 40) score -= 20;
    else if (smallCap > 20) score -= 10;
    
    if (largeCap > 60) score += 10;

    // Clamp score
    const finalScore = Math.max(10, Math.min(95, score));
    
    let label = "Medium risk";
    let tone = "warn";
    if (finalScore > 75) { label = "Low risk"; tone = "profit"; }
    else if (finalScore < 40) { label = "High risk"; tone = "loss"; }

    return { score: finalScore, label, tone };
  }, [displayHoldings, marketCapAllocation]);

  const dynamicAlerts = useMemo(() => {
    const alertsList = [];
    
    if (displayHoldings.length === 0) return [];

    // 1. Diversification Alert
    if (displayHoldings.length < 5) {
      alertsList.push({ title: "Portfolio is highly concentrated", type: "DIVERSIFICATION", tone: "loss" });
    }

    // 2. Sector Concentration
    const topSector = allocation[0];
    if (topSector && topSector.value > 40) {
      alertsList.push({ title: `High exposure to ${topSector.name} sector`, type: "CONCENTRATION", tone: "warn" });
    }

    // 3. Small cap risk
    const smallCap = marketCapAllocation.find(c => c.name === "Small cap")?.value || 0;
    if (smallCap > 35) {
      alertsList.push({ title: "Small-cap exposure is above 35%", type: "RISK", tone: "warn" });
    }

    // 4. Large cap anchor
    const largeCap = marketCapAllocation.find(c => c.name === "Large cap")?.value || 0;
    if (largeCap < 30) {
      alertsList.push({ title: "Low allocation to Large-cap 'anchors'", type: "STABILITY", tone: "loss" });
    }

    // Fallback if no specific alerts
    if (alertsList.length === 0) {
      alertsList.push({ title: "Portfolio metrics look healthy", type: "STABILITY", tone: "profit" });
    }

    return alertsList;
  }, [displayHoldings, allocation, marketCapAllocation]);

  const forecastData = useMemo(() => {
    if (!displayHoldings.length) return null;
    
    // Simple projection logic: take current performance and project 3 steps forward
    const baseValue = 100;
    const history = [
      { day: "W1", portfolio: baseValue, forecast: null },
      { day: "W2", portfolio: baseValue + 2.1, forecast: null },
      { day: "W3", portfolio: baseValue + 4.5, forecast: null },
    ];
    
    const lastVal = history[history.length - 1].portfolio;
    const volatility = riskScoreData.score < 40 ? 4 : 1.5;
    
    return [
      ...history,
      { day: "Next", portfolio: null, forecast: lastVal + volatility },
      { day: "Next+1", portfolio: null, forecast: lastVal + volatility * 1.8 },
      { day: "Next+2", portfolio: null, forecast: lastVal + volatility * 2.5 },
    ];
  }, [displayHoldings, riskScoreData.score]);

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
          <div className="relative mx-auto grid h-56 w-56 place-items-center rounded-full border-[18px] border-white/5 bg-white/[0.02]">
            {/* Dynamic gauge ring */}
            <div 
              className="absolute inset-[-18px] rounded-full border-[18px] border-transparent transition-all duration-1000" 
              style={{ 
                borderTopColor: riskScoreData.score > 40 ? '#22C55E' : '#EF4444',
                borderRightColor: riskScoreData.score > 70 ? '#22C55E' : (riskScoreData.score > 30 ? '#EAB308' : 'transparent'),
                transform: `rotate(${riskScoreData.score * 3.6}deg)`
              }}
            />
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{riskScoreData.score}</p>
              <p className={`mt-1 text-sm font-medium ${riskScoreData.tone === 'profit' ? 'text-profit' : riskScoreData.tone === 'loss' ? 'text-loss' : 'text-warn'}`}>
                {riskScoreData.label}
              </p>
            </div>
          </div>

        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Forecast"
            title="Prophet-style growth projection"
          />
          <ForecastChart data={forecastData} />

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
          {dynamicAlerts.map((alert) => (
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
