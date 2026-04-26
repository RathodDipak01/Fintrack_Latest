"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Plus,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  EyeOff,
  Info,
  XCircle,
} from "lucide-react";
import { DonutChart } from "@/components/charts";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader, StatCard } from "@/components/ui";
import { fintrackApi } from "@/lib/api";
import { useSettings } from "@/context/settings-context";

export default function PortfolioPage() {
  const { settings, updateSetting, getCurrencySymbol, formatCurrency, t } = useSettings();
  const symbol = getCurrencySymbol();

  const [sortField, setSortField] = useState("symbol");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSector, setSelectedSector] = useState(null);
  const [liveHoldings, setLiveHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ success: null, message: "" });
  const [filterSource, setFilterSource] = useState("INTEGRATED");
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  const fetchPortfolioData = () => {
    setIsLoading(true);
    Promise.all([
      fintrackApi.getHoldings(),
      fintrackApi.getSummary(),
    ])
      .then(([hData, sData]) => {
        const mapped = (hData || []).map((h) => ({
          ...h,
          avg: h.avgCost,
          price: h.currentPrice,
          change: h.changePercent,
          pnl: String(h.pnl),
          productType: h.productType || "CNC",
          source: h.source || "CSV"
        }));
        setLiveHoldings(mapped);
        setSummary(sData);
      })
      .catch((err) => {
        console.error(err);
        if (
          err.message.includes("Authentication") ||
          err.message.includes("401")
        ) {
          setLiveHoldings([]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const filteredHoldings = useMemo(() => {
    if (filterSource === "INTEGRATED") return liveHoldings;
    return liveHoldings.filter(h => h.source === filterSource);
  }, [liveHoldings, filterSource]);

  const aggregatedHoldings = useMemo(() => {
    if (filterSource !== "INTEGRATED") return filteredHoldings;
    
    const groups = {};
    filteredHoldings.forEach(h => {
      const q = parseFloat(h.qty) || 0;
      const a = parseFloat(h.avg) || 0;
      const p = parseFloat(h.price) || 0;

      if (!groups[h.symbol]) {
        groups[h.symbol] = { 
          ...h, 
          qty: q,
          avg: a,
          price: p,
          sources: [h.source],
          totalCost: q * a,
          totalValue: q * p
        };
      } else {
        groups[h.symbol].qty += q;
        groups[h.symbol].totalCost += q * a;
        groups[h.symbol].totalValue += q * p;
        if (!groups[h.symbol].sources.includes(h.source)) {
          groups[h.symbol].sources.push(h.source);
        }
      }
    });
    
    return Object.values(groups).map(g => {
      const avg = g.qty > 0 ? g.totalCost / g.qty : 0;
      const price = g.price;
      const pnl = g.totalValue - g.totalCost;
      const change = avg > 0 ? ((price - avg) / avg) * 100 : 0;
      
      return {
        ...g,
        avg,
        pnl: String(pnl.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        source: g.sources.length > 1 ? "MULTIPLE" : g.sources[0],
        allSources: g.sources
      };
    });
  }, [filteredHoldings, filterSource]);

  const allocation = useMemo(() => {
    if (!filteredHoldings.length) return [];
    const sectors = filteredHoldings.reduce((acc, h) => {
      const sector = h.sector || "Diversified";
      const value = (parseFloat(h.qty) || 0) * (parseFloat(h.price) || parseFloat(h.avg) || 0);
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    }, {});
    const totalValue = Object.values(sectors).reduce((s, v) => s + v, 0);
    return Object.entries(sectors).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(2))
    })).sort((a, b) => b.value - a.value);
  }, [filteredHoldings]);

  const filteredSummary = useMemo(() => {
    if (filterSource === "INTEGRATED" && summary) return summary;
    
    const totalInvestment = filteredHoldings.reduce((sum, h) => sum + (parseFloat(h.qty) * (parseFloat(h.avg) || 0)), 0);
    const currentValue = filteredHoldings.reduce((sum, h) => sum + (parseFloat(h.qty) * (parseFloat(h.price) || 0)), 0);
    const totalReturns = currentValue - totalInvestment;
    
    return {
      totalInvestment,
      currentValue,
      totalReturns
    };
  }, [filteredHoldings, filterSource, summary]);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleAngelOneSync = async () => {
    setIsSyncing(true);
    setSyncStatus({ success: null, message: "Logging in & syncing with Angel One..." });
    try {
      const data = await fintrackApi.syncAngelOne();
      setSyncStatus({ 
        success: true, 
        message: data.message || "Portfolio synced successfully!" 
      });
      fetchPortfolioData();
    } catch (error) {
      setSyncStatus({ 
        success: false, 
        message: error.message || "Failed to sync with Angel One." 
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus({ success: null, message: "" }), 5000);
    }
  };

  const handleZerodhaSync = async () => {
    setIsSyncing(true);
    setSyncStatus({ success: null, message: "Initiating Zerodha connection..." });
    try {
      const data = await fintrackApi.syncZerodha();
      if (data.requiresRedirect) {
        setSyncStatus({ success: null, message: "Redirecting to Zerodha login..." });
        window.location.href = data.loginUrl;
        return;
      }
      setSyncStatus({ 
        success: true, 
        message: data.message || "Zerodha portfolio synced successfully!" 
      });
      fetchPortfolioData();
    } catch (error) {
      setSyncStatus({ 
        success: false, 
        message: error.message || "Failed to sync with Zerodha." 
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus({ success: null, message: "" }), 5000);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedHoldings = useMemo(() => {
    let base = [...aggregatedHoldings];
    
    // Apply Sector Filter
    if (selectedSector) {
      base = base.filter(h => (h.sector || "Diversified") === selectedSector);
    }

    return base.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      const parseNum = (val) => {
        if (typeof val === "number") return val;
        if (typeof val !== "string") return 0;
        return parseFloat(val.replace(/[^\d.-]/g, ""));
      };

      if (["qty", "avg", "price", "change", "pnl"].includes(sortField)) {
        valA = parseNum(valA);
        valB = parseNum(valB);
      } else if (sortField === "buyValue") {
        valA = (a.qty || 0) * (a.avg || 0);
        valB = (b.qty || 0) * (b.avg || 0);
      } else if (sortField === "presentValue") {
        valA = (a.qty || 0) * (a.price || 0);
        valB = (b.qty || 0) * (b.price || 0);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [aggregatedHoldings, sortField, sortDirection, selectedSector]);

  const getMarketCap = (symbol) => {
    const s = symbol.toUpperCase().split('.')[0];
    const largeCaps = ["ADANIENT", "ADANIGREEN", "TCS", "HDFCBANK", "RELIANCE", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "BAJFINANCE", "MARUTI", "SUNPHARMA", "KOTAKBANK", "AXISBANK", "ONGC", "NTPC", "TATAMOTORS", "POWERGRID", "ASIANPAINT", "HCLTECH"];
    if (largeCaps.includes(s)) return "Large cap";
    const midCaps = ["CHOLAFIN", "DIVISLAB", "LTIM", "TVSMOTOR", "DLF", "EICHERMOT", "BAJAJ_AUTO", "TATASTEEL", "CONCOR"];
    if (midCaps.includes(s)) return "Mid cap";
    return "Small cap";
  };

  const stockAllocation = useMemo(() => {
    if (!aggregatedHoldings || aggregatedHoldings.length === 0) return [];
    const total = aggregatedHoldings.reduce((sum, h) => sum + (h.qty * (h.currentPrice || h.avg)), 0);
    if (total === 0) return [];
    const mapped = aggregatedHoldings.map(h => ({
      name: h.symbol,
      value: parseFloat((((h.qty * (h.currentPrice || h.avg)) / total) * 100).toFixed(2)),
      category: getMarketCap(h.symbol),
      sector: h.sector
    }));
    return mapped.sort((a,b) => b.value - a.value);
  }, [aggregatedHoldings]);

  const marketCapAllocation = useMemo(() => {
    if (!aggregatedHoldings || aggregatedHoldings.length === 0) return [];
    const capGroups = aggregatedHoldings.reduce((acc, h) => {
      const val = h.qty * (h.currentPrice || h.avg);
      const cap = getMarketCap(h.symbol);
      acc[cap] = (acc[cap] || 0) + val;
      return acc;
    }, {});
    
    const total = Object.values(capGroups).reduce((sum, v) => sum + v, 0);
    if (total === 0) return [];
    
    const order = ["Large cap", "Mid cap", "Small cap"];
    const colors = { "Large cap": "#4F46E5", "Mid cap": "#818CF8", "Small cap": "#C7D2FE" };
    
    return Object.entries(capGroups)
      .map(([name, val]) => ({
        name,
        value: parseFloat(((val / total) * 100).toFixed(2)),
        color: colors[name] || "#9CA3AF"
      }))
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [aggregatedHoldings]);

  const COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#F97316', '#06B6D4', '#EC4899', '#8B5CF6', '#14B8A6'];

  const diversificationResult = useMemo(() => {
    if (!aggregatedHoldings || aggregatedHoldings.length === 0 || !allocation.length || !marketCapAllocation.length) {
      return { score: 0, message: "No data", breakdown: [], issues: [] };
    }

    const reports = [];
    let sScore = 30;
    const maxSector = Math.max(...allocation.map(a => a.value));
    const top2Sector = allocation.slice(0, 2).reduce((sum, a) => sum + a.value, 0);
    if (maxSector > 30) {
      sScore -= 10;
      reports.push({ label: "Sector Concentration", value: "-10", detail: "Sector > 30%" });
    }
    if (top2Sector > 50) {
      sScore -= 10;
      reports.push({ label: "Sector Risk", value: "-10", detail: "Top 2 Sectors > 50%" });
    }

    let cScore = 25;
    const smallCap = marketCapAllocation.find(a => a.name === "Small cap")?.value || 0;
    const largeCap = marketCapAllocation.find(a => a.name === "Large cap")?.value || 0;
    if (smallCap > 60) {
      cScore -= 10;
      reports.push({ label: "Market Cap Risk", value: "-10", detail: "Small Cap > 60%" });
    }
    if (largeCap < 20) {
      cScore -= 10;
      reports.push({ label: "Market Cap Stability", value: "-10", detail: "Large Cap < 20%" });
    }

    let stScore = 25;
    const maxStock = Math.max(...stockAllocation.map(a => a.value));
    const top3Stock = stockAllocation.slice(0, 3).reduce((sum, a) => sum + a.value, 0);
    if (maxStock > 15) {
      stScore -= 10;
      reports.push({ label: "Stock Concentration", value: "-10", detail: "Stock > 15%" });
    }
    if (top3Stock > 50) {
      stScore -= 10;
      reports.push({ label: "Stock Risk", value: "-10", detail: "Top 3 Stocks > 50%" });
    }

    let countMarks = 0;
    const count = aggregatedHoldings.length;
    if (count < 5) countMarks = 2;
    else if (count <= 10) countMarks = 6;
    else if (count <= 20) countMarks = 10;
    else countMarks = 8;
    reports.push({ label: "Stock Count", value: `${countMarks}/10`, detail: `${count} stocks` });

    let corrScore = 10;
    const hasAuto = allocation.some(a => a.name.includes("Auto"));
    const hasAutoAnc = allocation.some(a => a.name.includes("Auto & Components"));
    if (hasAuto && hasAutoAnc) {
      corrScore -= 5;
      reports.push({ label: "Hidden Correlation", value: "-5", detail: "Auto + Auto & Components detected" });
    }

    const totalScore = Math.max(0, sScore + cScore + stScore + countMarks + corrScore);
    
    let message = "";
    if (totalScore >= 80) message = "Portfolio is well diversified";
    else if (totalScore >= 60) message = "Moderate diversification with improvement needed";
    else message = "Portfolio lacks sufficient diversification";

    return {
      score: totalScore,
      message,
      breakdown: [
        { label: "Sector Diversification", score: sScore, max: 30 },
        { label: "Market Cap Mix", score: cScore, max: 25 },
        { label: "Stock Distribution", score: stScore, max: 25 },
        { label: "Number of Stocks", score: countMarks, max: 10 },
        { label: "Correlation Risk", score: corrScore, max: 10 },
      ],
      issues: reports
    };
  }, [aggregatedHoldings, allocation, marketCapAllocation, stockAllocation]);

  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    }
    if (showInfo) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfo]);

  const renderHeader = (label, field, className = "") => (
    <th
      className={`cursor-pointer px-3 py-3 font-semibold transition hover:bg-white/5 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${className.includes("text-right") ? "justify-end" : ""}`}>
        {label}
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-30" />
        )}
      </div>
    </th>
  );

  const portfolioPerformance = useMemo(() => {
    if (!filteredSummary.totalInvestment || filteredSummary.totalInvestment === 0) return 0;
    return (filteredSummary.totalReturns / filteredSummary.totalInvestment) * 100;
  }, [filteredSummary]);

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          Portfolio Management
        </p>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            Holdings, allocation and P&L
          </h1>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className="text-slate-500 hover:text-ai transition mt-2"
          >
            {isPrivate ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
        <p className="mt-4 max-w-3xl text-slate-400 leading-relaxed">
          Master your wealth with a unified view of all your holdings. Fintrack’s AI engine 
          analyzes your diversification and sector risk in real-time. Securely sync with{" "}
          <Link
            href="/import"
            className="text-ai font-semibold underline-offset-4 hover:underline"
          >
            leading Indian brokers
          </Link>{" "}
          or{" "}
          <Link
            href="/import"
            className="text-ai font-semibold underline-offset-4 hover:underline"
          >
            upload custom data
          </Link>{" "}
          to transform your raw positions into actionable investment intelligence.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={handleAngelOneSync}
            disabled={isSyncing}
            className={`inline-flex items-center gap-2 rounded-md border border-ai/40 bg-ai/10 px-4 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Upload size={16} className={isSyncing ? "animate-pulse" : ""} />
            {isSyncing ? "Syncing..." : "Sync from Angel One"}
          </button>

          <button
            onClick={handleZerodhaSync}
            disabled={isSyncing}
            className={`inline-flex items-center gap-2 rounded-md border border-ai/40 bg-ai/10 px-4 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Upload size={16} className={isSyncing ? "animate-pulse" : ""} />
            {isSyncing ? "Syncing..." : "Sync from Zerodha"}
          </button>
          
          <Link
            href="/import"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            <Plus size={16} />
            Other brokers / CSV
          </Link>

          {syncStatus.message && (
            <div className={`text-sm font-medium animate-in fade-in slide-in-from-left-2 ${
              syncStatus.success === true ? "text-profit" : 
              syncStatus.success === false ? "text-loss" : "text-ai"
            }`}>
              {syncStatus.message}
            </div>
          )}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mt-8 relative z-30">
        <StatCard
          label="Total investment"
          value={filteredSummary.totalInvestment}
          change="Cost basis"
          isPrivate={isPrivate}
          onTogglePrivacy={() => setIsPrivate(!isPrivate)}
          showPrivacyToggle
        />
        <StatCard
          label="Current value"
          value={filteredSummary.currentValue}
          change={`${portfolioPerformance >= 0 ? "+" : ""}${portfolioPerformance.toFixed(2)}%`}
          tone={portfolioPerformance >= 0 ? "profit" : "loss"}
          isPrivate={isPrivate}
          onTogglePrivacy={() => setIsPrivate(!isPrivate)}
          showPrivacyToggle
        />
        <StatCard
          label="Unrealized P&L"
          value={filteredSummary.totalReturns}
          change={`${portfolioPerformance >= 0 ? "+" : ""}${portfolioPerformance.toFixed(2)}%`}
          tone={portfolioPerformance >= 0 ? "profit" : "loss"}
          isPrivate={isPrivate}
          onTogglePrivacy={() => setIsPrivate(!isPrivate)}
          showPrivacyToggle
        />
        <StatCard
          label="Holdings"
          value={String(aggregatedHoldings.length)}
          change={isLoading ? "Loading..." : "Active Filter"}
          tone="warn"
          isCurrency={false}
        />
        <GlassCard className={`p-5 flex flex-col justify-between relative min-h-[140px] ${showInfo ? 'z-50' : 'z-auto'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">Diversification</p>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="text-slate-500 hover:text-ai transition"
              >
                <Info size={14} />
              </button>
            </div>
            {showInfo && (
              <div 
                ref={infoRef}
                className="absolute top-12 right-0 z-[100] w-64 rounded-lg border border-white/20 bg-slate-950 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-ai mb-3">Calculation Breakdown</h4>
                <div className="space-y-2">
                  {diversificationResult.breakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-mono">{item.score}/{item.max}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-3 border-white/10" />
                <div className="text-[10px] text-slate-500 leading-relaxed max-h-32 overflow-y-auto thin-scrollbar">
                  {diversificationResult.issues.length > 0 ? (
                    <ul className="list-disc pl-3 space-y-1">
                      {diversificationResult.issues.map((iss, i) => (
                        <li key={i}>{iss.detail} ({iss.value})</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No critical risks detected. Well balanced portfolio!</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col items-start gap-1">
            <strong className="text-3xl font-bold tracking-tight text-white">
              {diversificationResult.score}<sub className="text-xs font-normal text-slate-500">/100</sub>
            </strong>
            <span
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                diversificationResult.score >= 80 ? 'bg-profit/10 text-profit' : 
                diversificationResult.score >= 60 ? 'bg-ai/10 text-ai' : 'bg-loss/10 text-loss'
              }`}
            >
              {diversificationResult.score >= 80 ? 'Excellent' : 
               diversificationResult.score >= 60 ? 'Moderate' : 'Poor'}
            </span>
          </div>
          <p className="mt-3 text-[9px] text-slate-500 italic line-clamp-1">
            "{diversificationResult.message}"
          </p>
        </GlassCard>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-widest">View Source:</span>
        {[
          { id: "INTEGRATED", name: "Integrated (All)" },
          { id: "ZERODHA", name: "Zerodha" },
          { id: "ANGEL_ONE", name: "Angel One" },
          { id: "GROWW", name: "Groww" },
          { id: "UPSTOX", name: "Upstox" },
          { id: "CSV", name: "CSV / Manual" },
        ].map((source) => {
          const isActive = filterSource === source.id;
          const hasData = source.id === "INTEGRATED" || liveHoldings.some(h => h.source === source.id);
          
          return (
            <button
              key={source.id}
              onClick={() => setFilterSource(source.id)}
              disabled={!hasData && source.id !== "INTEGRATED"}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive 
                  ? "bg-ai text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105" 
                  : hasData 
                    ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white" 
                    : "bg-white/[0.02] text-slate-700 cursor-not-allowed"
              }`}
            >
              {source.name}
            </button>
          );
        })}

        {filterSource !== "INTEGRATED" && (
          <button
            onClick={async () => {
              if (confirm(`Remove all holdings from ${filterSource}?`)) {
                await fintrackApi.disconnectBroker(filterSource);
                fetchPortfolioData();
              }
            }}
            className="ml-4 px-3 py-1.5 rounded-md border border-loss/30 bg-loss/5 text-loss text-xs font-bold hover:bg-loss hover:text-white transition-all flex items-center gap-1.5"
          >
            <XCircle size={14} />
            Clear {filterSource}
          </button>
        )}
      </div>

      <section className="flex flex-col gap-6 mt-2">
        <GlassCard className="overflow-hidden p-6 order-2 w-full">
          <SectionHeader
            eyebrow="Holdings"
            title="Stocks in portfolio"
            action={
              <div className="flex flex-wrap gap-2">
                <button className="rounded-md bg-ai px-3 py-2 text-sm font-semibold text-white">
                  <Plus size={14} className="mr-1 inline" /> Add to watchlist
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
                    className={`rounded-md border border-white/10 px-3 py-2 text-sm transition-all ${selectedSector ? 'bg-ai text-white border-ai' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    {selectedSector || "Sector"} <ChevronDown size={14} className={`inline transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSectorDropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a0a]/95 p-1 backdrop-blur-md shadow-2xl">
                      <button
                        onClick={() => { setSelectedSector(null); setIsSectorDropdownOpen(false); }}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${!selectedSector ? 'bg-ai/10 text-ai' : 'text-slate-400 hover:bg-white/5'}`}
                      >
                        All Sectors
                      </button>
                      <div className="my-1 h-px bg-white/5" />
                      {allocation.map((s) => (
                        <button
                          key={s.name}
                          onClick={() => { setSelectedSector(s.name); setIsSectorDropdownOpen(false); }}
                          className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${selectedSector === s.name ? 'bg-ai/10 text-ai' : 'text-slate-400 hover:bg-white/5'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">
                  P&L <ChevronDown size={14} className="inline" />
                </button>
              </div>
            }
          />

          <div className="thin-scrollbar overflow-x-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/5">
                <tr>
                  {renderHeader("Name(Symbol)", "symbol")}
                  {renderHeader("Qty.", "qty", "text-right")}
                  {renderHeader("Buy avg.", "avg", "text-right")}
                  {renderHeader("Buy value", "buyValue", "text-right")}
                  {renderHeader("LTP", "price", "text-right")}
                  {renderHeader("Present value", "presentValue", "text-right")}
                  {renderHeader("P&L", "pnl", "text-right")}
                  {renderHeader("P&L chg.", "change", "text-right")}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Loading live portfolio positions...
                    </td>
                  </tr>
                )}
                {!isLoading && sortedHoldings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No holdings found. Please login or add assets.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  sortedHoldings.map((stock) => (
                    <tr
                      key={stock.id || `${stock.symbol}-${stock.source}`}
                      className="text-xs text-slate-300 transition hover:bg-white/[0.07] border-b border-white/5"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded bg-white/5 font-semibold text-white text-[10px]">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white leading-tight">
                                {stock.name}
                              </p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border border-white/5 ${stock.source === 'MULTIPLE' ? 'bg-ai/10 text-ai border-ai/20' : 'bg-white/5 text-slate-500'}`}>
                                {stock.source}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              ({stock.symbol})
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right font-mono">
                        {parseFloat(stock.qty || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                      </td>
                      <td className="px-3 py-4 text-right font-mono">
                        {isPrivate ? "••••" : formatCurrency(stock.avg || 0)}
                      </td>
                      <td className="px-3 py-4 text-right font-mono text-slate-400">
                        {isPrivate ? "••••" : formatCurrency(stock.qty * (stock.avg || 0))}
                      </td>
                      <td className="px-3 py-4 text-right font-mono">
                        {isPrivate ? "••••" : formatCurrency(stock.price || 0)}
                      </td>
                      <td className="px-3 py-4 text-right font-mono text-white">
                        {isPrivate ? "••••" : formatCurrency(stock.qty * (stock.price || 0))}
                      </td>
                      <td
                        className={`px-3 py-4 text-right font-mono font-semibold ${String(stock.pnl).startsWith("-") ? "text-loss" : "text-profit"}`}
                      >
                        {isPrivate ? "••••" : formatCurrency(stock.pnl)}
                      </td>
                      <td
                        className={`px-3 py-4 text-right font-mono font-semibold ${stock.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {stock.change >= 0 ? "+" : ""}{parseFloat(stock.change || 0).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6 order-1 w-full">
          <SectionHeader
            eyebrow="Allocation"
            title="Portfolio breakdown"
            action={
              <Pill tone={diversificationResult.score >= 80 ? "profit" : diversificationResult.score >= 60 ? "ai" : "loss"}>
                {diversificationResult.message}
              </Pill>
            }
          />
          <div className="grid md:grid-cols-2 gap-8 md:gap-4 mt-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-[200px] shrink-0">
                <DonutChart 
                  data={allocation} 
                  title="Sectors" 
                  onItemClick={(item) => setSelectedSector(selectedSector === item.name ? null : item.name)}
                />
              </div>
              <div className="w-full max-h-[230px] overflow-y-auto thin-scrollbar pr-2 space-y-3">
                {allocation.map((item, index) => (
                  <div 
                    key={item.name} 
                    onClick={() => setSelectedSector(selectedSector === item.name ? null : item.name)}
                    className={`flex justify-between text-sm items-center cursor-pointer p-1.5 rounded-md transition-all ${selectedSector === item.name ? 'bg-ai/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-ai/30' : 'hover:bg-white/[0.04]'}`}
                  >
                    <div className="flex items-center gap-3 w-4/5">
                      <div 
                        className="h-2.5 w-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className={`truncate ${selectedSector === item.name ? 'text-white font-medium' : 'text-slate-300'}`}>{item.name}</span>
                    </div>
                    <span className={`font-mono text-xs ${selectedSector === item.name ? 'text-ai font-bold' : 'text-slate-500'}`}>{item.value.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-[200px] shrink-0">
                <DonutChart 
                  data={stockAllocation} 
                  innerData={marketCapAllocation} 
                  title="Stocks" 
                  highlightCriteria={selectedSector}
                  highlightKey="sector"
                />
              </div>
              <div className="w-full max-h-[230px] overflow-y-auto thin-scrollbar pr-2 space-y-3">
                {marketCapAllocation.map((item, index) => (
                  <div key={item.name} className="flex justify-between text-sm items-center hover:bg-white/[0.04] p-1.5 rounded-md transition-colors">
                    <div className="flex items-center gap-3 w-4/5">
                      <div 
                        className="h-2.5 w-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-200 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-xs">{item.value.toFixed(2)}%</span>
                  </div>
                ))}
                
                <hr className="border-white/10 my-2" />
                
                {stockAllocation.map((item, index) => {
                  const isHighlighted = selectedSector && item.sector === selectedSector;
                  return (
                    <div 
                      key={item.name} 
                      className={`flex justify-between text-sm items-center p-1.5 rounded-md transition-all ${isHighlighted ? 'bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'opacity-75 hover:bg-white/[0.04]'}`}
                    >
                      <div className="flex items-center gap-3 w-4/5">
                        <div 
                          className="h-2.5 w-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className={`truncate ${isHighlighted ? 'text-white font-semibold' : 'text-slate-300'}`}>{item.name}</span>
                      </div>
                      <span className={`font-mono text-xs ${isHighlighted ? 'text-white' : 'text-slate-500'}`}>{item.value.toFixed(2)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </GlassCard>
      </section>
    </AppShell>
  );
}
