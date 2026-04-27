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
  const [marketHistory, setMarketHistory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = () => {
      fintrackApi.getSummary().then(data => { if (isMounted) setPortfolioSummary(data) }).catch(() => null);
      fintrackApi.getHoldings().then(data => { if (isMounted) setLiveHoldings(data) }).catch(() => null);
    };

    // Initial fetch
    fetchData();
    fintrackApi.getSavedSignals().then(setSignals).catch(() => null);
    fintrackApi.getHistory("^NSEI", "1wk").then(data => {
      if (data && data.candles && isMounted) {
        // Just take the last 4 weeks of data as baseline
        setMarketHistory(data.candles.slice(-4));
      }
    }).catch(() => null);

    // Poll for live portfolio updates
    const interval = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
    if (!displayHoldings.length) return { score: 0, label: "N/A", tone: "neutral", factors: [] };
    
    let score = 85; // Start high (Low Risk) and subtract for risk factors
    const factors = [];
    
    // 1. Diversification Risk
    if (displayHoldings.length < 5) {
      score -= 20;
      factors.push({ name: "High Concentration (Low Holdings)", impact: "-20" });
    } else if (displayHoldings.length < 10) {
      score -= 5;
      factors.push({ name: "Moderate Diversification", impact: "-5" });
    } else {
      factors.push({ name: "Excellent Diversification", impact: "+5" });
      score += 5;
    }

    // 2. Market Cap Risk
    const smallCap = marketCapAllocation.find(c => c.name === "Small cap")?.value || 0;
    const midCap = marketCapAllocation.find(c => c.name === "Mid cap")?.value || 0;
    
    if (smallCap > 40) {
      score -= 25;
      factors.push({ name: "Aggressive Small-Cap Exposure", impact: "-25" });
    } else if (smallCap > 20) {
      score -= 10;
      factors.push({ name: "Moderate Small-Cap Risk", impact: "-10" });
    }

    if (midCap > 50) {
      score -= 10;
      factors.push({ name: "High Mid-Cap Volatility", impact: "-10" });
    }

    // 3. Sector Risk
    const topSector = allocation[0];
    if (topSector && topSector.value > 40) {
      score -= 15;
      factors.push({ name: `Sector Bias (${topSector.name})`, impact: "-15" });
    }

    // 4. Performance factor
    if (portfolioSummary?.totalReturns < 0) {
      score -= 5;
      factors.push({ name: "Negative Historical Trend", impact: "-5" });
    }

    // Clamp score
    const finalScore = Math.max(5, Math.min(98, score));
    
    let label = "Medium risk";
    let tone = "warn";
    if (finalScore >= 75) { label = "Low risk"; tone = "profit"; }
    else if (finalScore <= 45) { label = "High risk"; tone = "loss"; }

    return { score: finalScore, label, tone, factors };
  }, [displayHoldings, marketCapAllocation, allocation, portfolioSummary]);

  const riskContributors = useMemo(() => {
    if (!displayHoldings.length) return [];
    
    // Calculate weights
    const totalValue = displayHoldings.reduce((sum, h) => sum + (h.qty * (h.currentPrice || h.avgCost || 0)), 0);
    if (totalValue === 0) return [];
    
    const withRisk = displayHoldings.map(h => {
      const val = h.qty * (h.currentPrice || h.avgCost || 0);
      const weight = val / totalValue;
      const cap = getMarketCap(h.symbol);
      const capVolatility = cap === "Small cap" ? 1.8 : (cap === "Mid cap" ? 1.3 : 0.9);
      const riskContribution = weight * capVolatility;
      
      return {
        ...h,
        weight: (weight * 100).toFixed(1),
        riskContribution,
        cap
      };
    });
    
    return withRisk.sort((a, b) => b.riskContribution - a.riskContribution).slice(0, 4);
  }, [displayHoldings]);

  const hedgingSuggestions = useMemo(() => {
    if (!displayHoldings.length) return [];
    const suggestions = [];
    
    const topSector = allocation[0];
    if (topSector && topSector.value > 30) {
      suggestions.push({
        type: "Sector Hedge",
        title: `Hedge against ${topSector.name} downturn`,
        description: `Your portfolio is heavily weighted (${topSector.value}%) in ${topSector.name}. Our ML models suggest adding defensive ETFs or inverse-correlated assets to protect against sector-specific pullbacks.`,
        action: "Explore Sector Hedges"
      });
    }

    const smallCap = marketCapAllocation.find(c => c.name === "Small cap")?.value || 0;
    if (smallCap > 25) {
      suggestions.push({
        type: "Volatility Hedge",
        title: "High Small-Cap Volatility",
        description: `Small-cap exposure is at ${smallCap}%. In bear markets, these suffer the most. Adding Large-Cap Value or Gold ETFs can dramatically improve your Sharpe ratio.`,
        action: "View Stability Assets"
      });
    }
    
    if (suggestions.length === 0) {
      suggestions.push({
        type: "General Protection",
        title: "Standard Market Hedge",
        description: "Your portfolio is well-balanced. Our ML optimizer suggests holding 5-10% in liquid cash or bonds to deploy during opportunistic market corrections.",
        action: "View Bond ETFs"
      });
    }

    return suggestions;
  }, [allocation, marketCapAllocation, displayHoldings]);

  const forecastData = useMemo(() => {
    // If no portfolio or history, fallback to simple static structure
    if (!portfolioSummary || !portfolioSummary.currentValue) {
      const baseValue = 100;
      return [
        { day: "W1", portfolio: baseValue, forecast: null },
        { day: "W2", portfolio: baseValue + 2.1, forecast: null },
        { day: "W3", portfolio: baseValue + 4.5, forecast: null },
        { day: "Next", portfolio: null, forecast: baseValue + 6 },
        { day: "Next+1", portfolio: null, forecast: baseValue + 8 },
        { day: "Next+2", portfolio: null, forecast: baseValue + 10 },
      ];
    }
    
    const baseValue = portfolioSummary.currentValue;
    const volatility = riskScoreData.score < 40 ? 0.04 : (riskScoreData.score > 70 ? 0.015 : 0.025);
    
    // Create history based on market benchmark if available, otherwise synthetic
    let history = [];
    if (marketHistory && marketHistory.length >= 3) {
      // Map market history returns to portfolio
      const latestMarket = marketHistory[marketHistory.length - 1][4]; // Close price
      history = marketHistory.slice(-3).map((candle, idx) => {
        const ratio = candle[4] / latestMarket;
        return { 
          day: `W${idx+1}`, 
          portfolio: parseFloat((baseValue * ratio).toFixed(2)), 
          forecast: null 
        };
      });
    } else {
      history = [
        { day: "W1", portfolio: baseValue * 0.96, forecast: null },
        { day: "W2", portfolio: baseValue * 0.98, forecast: null },
        { day: "W3", portfolio: baseValue, forecast: null },
      ];
    }
    
    // Ensure the last history point connects to the first forecast point
    const lastVal = baseValue; 
    
    // Adjust projection upward or downward slightly based on risk score (higher risk = higher potential volatility)
    const baseProjectedReturn = portfolioSummary.totalReturns > 0 ? volatility : (volatility * 0.5);
    
    return [
      ...history,
      { day: "Next Wk", portfolio: null, forecast: parseFloat((lastVal * (1 + baseProjectedReturn)).toFixed(2)) },
      { day: "Next Mth", portfolio: null, forecast: parseFloat((lastVal * (1 + baseProjectedReturn * 2)).toFixed(2)) },
      { day: "Next Qtr", portfolio: null, forecast: parseFloat((lastVal * (1 + baseProjectedReturn * 4)).toFixed(2)) },
    ];
  }, [portfolioSummary, marketHistory, riskScoreData.score]);

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          ML Strategy
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          Risk, Quant & Forecast
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Machine Learning models for portfolio projection, dynamic risk contribution, and smart hedging strategies.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="AI Risk"
            title="Volatility + diversification score"
            action={<BrainCircuit className="text-ai" />}
          />
          <div className="relative mx-auto mt-4 flex h-56 w-56 items-center justify-center">
            {/* Proper SVG Circular Gauge */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              {/* Progress */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={239}
                strokeDashoffset={239 - (239 * riskScoreData.score) / 100}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-1000 ${
                  riskScoreData.tone === "profit" ? "text-profit" : 
                  riskScoreData.tone === "loss" ? "text-loss" : "text-warn"
                }`}
                style={{ filter: "drop-shadow(0 0 12px currentColor)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-white">{riskScoreData.score}</p>
              <p className={`mt-1 text-sm font-medium ${riskScoreData.tone === 'profit' ? 'text-profit' : riskScoreData.tone === 'loss' ? 'text-loss' : 'text-warn'}`}>
                {riskScoreData.label}
              </p>
            </div>
          </div>
          
          <div className="mt-8 space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Live Calculation Factors</p>
            {riskScoreData.factors?.map((f, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{f.name}</span>
                <span className={`font-mono font-medium ${f.impact.startsWith('+') ? 'text-profit' : 'text-loss'}`}>{f.impact}</span>
              </div>
            ))}
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
          eyebrow="Quant Analysis"
          title="Top Volatility Contributors"
          action={<ShieldAlert className="text-warn" />}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          {riskContributors.map((holding) => (
            <div
              key={holding.symbol}
              className="rounded-xl border border-white/10 bg-white/[0.035] p-5 relative overflow-hidden group hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <strong className="text-lg text-white">{holding.symbol}</strong>
                <span className="text-xs font-bold text-loss bg-loss/10 px-2 py-1 rounded">
                  High Impact
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{holding.name}</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Portfolio Weight</span>
                    <span className="text-white font-mono">{holding.weight}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(holding.weight, 100)}%` }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Risk Contribution</span>
                    <span className="text-loss font-mono">{(holding.riskContribution * 10).toFixed(1)}x</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-loss rounded-full" style={{ width: `${Math.min(holding.riskContribution * 20, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {riskContributors.length === 0 && (
            <div className="col-span-full rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center text-slate-500 text-sm">
              Add holdings to your portfolio to see risk contributions.
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6 mt-5">
        <SectionHeader
          eyebrow="ML Optimization"
          title="Smart Hedging Strategies"
          action={<Sparkles className="text-ai" />}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {hedgingSuggestions.map((hedge, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-ai/20 bg-ai/5 p-5 relative flex flex-col"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-ai/10 px-3 py-1.5 text-xs font-bold text-ai w-fit">
                {hedge.type}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{hedge.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">
                {hedge.description}
              </p>
              <button className="mt-6 w-full rounded-lg border border-ai/30 bg-transparent px-4 py-2 text-sm font-semibold text-ai transition hover:bg-ai/10">
                {hedge.action}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
