"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bell,
  BrainCircuit,
  ChevronDown,
  Eye,
  EyeOff,
  Gauge,
  LineChart,
  LogIn,
  Menu,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Zap,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AllocationChart,
  CandleProxyChart,
  ForecastChart,
  MobilePriceChart,
  PerformanceChart,
  Sparkline,
} from "@/components/charts";
import { GlassCard, Pill, SectionHeader, StatCard } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { WatchlistPanel } from "@/components/watchlist-panel";
import { MarketTicker } from "@/components/market-ticker";
import { DonutChart } from "@/components/charts";
import { StockSearchBar } from "@/components/stock-search-bar";
import { FeatureGuard } from "@/components/feature-guard";
import { fintrackApi } from "@/lib/api";
import TradingViewWidget from "@/components/tradingview-widget";
import CustomChart from "@/components/custom-chart";
import {
  alerts,
  analystRatings,
  companyInsights,
  keyEvents,
  sentimentDetails,
  shareholdingPatterns,
  stockSignals,
  suggestionHistory,
} from "@/lib/portfolio-data";
import { GeminiAdvisor } from "@/components/ai-advisor";
import { AppShell } from "@/components/app-shell";
import { useSettings } from "@/context/settings-context";

const tabs = ["7D", "1M", "3M", "1Y"];

function Hero({ summary, isPrivate, onTogglePrivacy, performance }) {
  const { formatCurrency, t } = useSettings();
  
  const netWorth = summary?.currentValue || 0;
  const totalReturns = summary?.totalReturns || 0;
  const isUp = performance >= 0;

  return (
    <section id="dashboard" className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 bg-ai/10 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_260px] md:items-end">
          <div>
            <Pill tone="ai">AI risk engine active</Pill>
            <div className="mt-6 flex items-center gap-2">
              <p className="text-sm text-slate-400">{t("net_worth")}</p>
              <button
                onClick={onTogglePrivacy}
                className="text-slate-500 hover:text-ai transition"
              >
                {isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-normal text-white md:text-6xl">
              {isPrivate
                ? "••••••••"
                : formatCurrency(netWorth)}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`rounded-md px-3 py-2 text-sm font-semibold ${isUp ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
                {isUp ? "+" : ""}{formatCurrency(totalReturns)} total
              </span>
              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-slate-300">
                {isUp ? "+" : ""}{performance.toFixed(2)}% vs +0.84% NIFTY50
              </span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              {isUp 
                ? "Your portfolio is beating the benchmark. Returns are well distributed across sectors."
                : "Your portfolio is currently underperforming the benchmark. Consider reviewing sector weights."}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <Sparkline />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">5-day momentum</span>
              <span className="font-semibold text-profit">Strong</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <FeatureGuard minimumPlan="lite" featureName="AI risk summary">
        <GlassCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">AI Insights</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Moderately risky
              </h2>
            </div>
            <BrainCircuit className="text-ai" size={30} />
          </div>
          <div className="mt-6 space-y-4">
            {[
              "Expected growth next week: +3.2%",
              "Overexposed to IT sector",
              "Downside risk reduced by banking allocation",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + index * 0.08 }}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
              >
                <Sparkles
                  size={18}
                  className={index === 1 ? "text-warn" : "text-ai"}
                />
                <span className="text-sm text-slate-200">{item}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </FeatureGuard>
    </section>
  );
}

function Stats({ summary, isPrivate, onTogglePrivacy, diversificationResult, performance }) {
  const { formatCurrency, t } = useSettings();

  const format = (val) => formatCurrency(val);
  const perfString = `${performance >= 0 ? "+" : ""}${performance.toFixed(2)}%`;
  const tone = performance >= 0 ? "profit" : "loss";

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

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 relative z-30">
      <StatCard
        label="Total investment"
        value={format(summary?.totalInvestment || 0)}
        change="Cost basis"
        isPrivate={isPrivate}
        onTogglePrivacy={onTogglePrivacy}
        showPrivacyToggle
      />
      <StatCard
        label="Current value"
        value={format(summary?.currentValue || 0)}
        change={perfString}
        tone={tone}
        isPrivate={isPrivate}
        onTogglePrivacy={onTogglePrivacy}
        showPrivacyToggle
      />
      <StatCard
        label="Total returns"
        value={format(summary?.totalReturns || 0)}
        change={perfString}
        tone={tone}
        isPrivate={isPrivate}
        onTogglePrivacy={onTogglePrivacy}
        showPrivacyToggle
      />
      <GlassCard className={`p-5 flex flex-col justify-between relative min-h-[140px] ${showInfo ? 'z-50' : 'z-auto'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-400">Risk Score</p>
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
              className="absolute top-12 right-0 sm:left-0 z-[100] w-64 rounded-lg border border-white/20 bg-slate-950 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
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
                  <p>Analyzing live portfolio metrics...</p>
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
              diversificationResult.score >= 60 ? 'bg-ai/10 text-ai' : diversificationResult.score > 0 ? 'bg-loss/10 text-loss' : 'bg-white/5 text-slate-400'
            }`}
          >
            {diversificationResult.score >= 80 ? 'Good' : 
             diversificationResult.score >= 60 ? 'Moderate' : 
             diversificationResult.score > 0 ? 'Risky' : 'N/A'}
          </span>
        </div>
        <p className="mt-3 text-[9px] text-slate-500 italic line-clamp-1">
          "{diversificationResult.message}"
        </p>
      </GlassCard>
    </section>
  );
}

function Performance() {
  return (
    <GlassCard className="p-6">
      <SectionHeader
        eyebrow="Performance"
        title="Portfolio vs NIFTY50"
        action={
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                className={`rounded-md px-3 py-2 text-sm ${index === 1 ? "bg-ai text-white" : "text-slate-400"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      />

      <PerformanceChart />
    </GlassCard>
  );
}

function Portfolio({ holdings, allocation, isPrivate, stockAllocation, marketCapAllocation, diversificationResult }) {
  const { formatCurrency } = useSettings();
  const COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#F97316', '#06B6D4', '#EC4899', '#8B5CF6', '#14B8A6'];

  const [sortField, setSortField] = useState("symbol");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedSector, setSelectedSector] = useState(null);

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle numeric conversion for relevant fields
      if (["qty", "avgCost", "currentPrice", "changePercent", "pnl"].includes(sortField)) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortField === "buyValue") {
        valA = (a.qty || 0) * (a.avgCost || 0);
        valB = (b.qty || 0) * (b.avgCost || 0);
      } else if (sortField === "presentValue") {
        valA = (a.qty || 0) * (a.currentPrice || a.avgCost || 0);
        valB = (b.qty || 0) * (b.currentPrice || b.avgCost || 0);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [holdings, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderHeader = (label, field, className = "") => (
    <th
      className={`group cursor-pointer px-3 py-3 font-semibold transition hover:bg-white/5 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${className.includes("text-right") ? "justify-end" : ""}`}>
        {label}
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ArrowUp size={12} className="text-ai" />
          ) : (
            <ArrowDown size={12} className="text-ai" />
          )
        ) : (
          <ArrowUpDown
            size={12}
            className="opacity-0 transition group-hover:opacity-30"
          />
        )}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col gap-6" id="portfolio">
      {/* Allocation Section First */}
      <GlassCard className="p-6">
        <SectionHeader 
          eyebrow="Allocation" 
          title="Sector distribution" 
          action={
            <Pill tone={diversificationResult.score >= 80 ? "profit" : diversificationResult.score >= 60 ? "ai" : "loss"}>
              {diversificationResult.message}
            </Pill>
          }
        />
        <div className="grid md:grid-cols-2 gap-8 md:gap-4 mt-6">
          
          {/* Sectors Column */}
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

          {/* Stocks & Market Cap Column */}
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

      {/* Holdings Section Second (Full Width) */}
      <GlassCard className="overflow-hidden p-6">
        <SectionHeader
          eyebrow="Portfolio"
          title="Holdings intelligence"
          action={
            <div className="flex gap-2">
              <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">
                Sector <ChevronDown size={14} className="inline" />
              </button>
              <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">
                P&L <ChevronDown size={14} className="inline" />
              </button>
            </div>
          }
        />

        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
            <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/5">
              <tr>
                {renderHeader("Name(Symbol)", "symbol")}
                {renderHeader("Qty.", "qty", "text-right")}
                {renderHeader("Buy avg.", "avgCost", "text-right")}
                {renderHeader("Buy value", "buyValue", "text-right")}
                {renderHeader("LTP", "currentPrice", "text-right")}
                {renderHeader("Present value", "presentValue", "text-right")}
                {renderHeader("P&L", "pnl", "text-right")}
                {renderHeader("P&L chg.", "changePercent", "text-right")}
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No holdings found. Please login or import data.
                  </td>
                </tr>
              )}
              {sortedHoldings.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="text-xs text-slate-300 transition hover:bg-white/[0.07] border-b border-white/5"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded bg-white/5 font-semibold text-white text-[10px]">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white leading-tight">{stock.name}</p>
                        <p className="text-[10px] text-slate-500">({stock.symbol})</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right font-mono">{stock.qty}</td>
                  <td className="px-3 py-4 text-right font-mono">
                    {isPrivate ? "••••" : formatCurrency(stock.avgCost || 0)}
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-slate-400">
                    {isPrivate ? "••••" : formatCurrency(stock.qty * (stock.avgCost || 0))}
                  </td>
                  <td className="px-3 py-4 text-right font-mono">
                    {isPrivate ? "••••" : formatCurrency(stock.currentPrice || stock.avgCost || 0)}
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-white">
                    {isPrivate ? "••••" : formatCurrency(stock.qty * (stock.currentPrice || stock.avgCost || 0))}
                  </td>
                  <td className={`px-3 py-4 text-right font-mono font-semibold ${String(stock.pnl).startsWith("-") ? "text-loss" : "text-profit"}`}>
                    {isPrivate ? "••••" : formatCurrency(stock.pnl)}
                  </td>
                  <td className={`px-3 py-4 text-right font-mono font-semibold ${parseFloat(stock.changePercent) >= 0 ? "text-profit" : "text-loss"}`}>
                    {parseFloat(stock.changePercent) >= 0 ? "+" : ""}{stock.changePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function AiInsights() {
  return (
    <section id="ai-insights" className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="AI Risk"
          title="Volatility + diversification score"
        />
        <div className="relative mx-auto grid h-56 w-56 place-items-center rounded-full border-[18px] border-ai/20 bg-white/[0.035]">
          <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-r-warn border-t-profit" />
          <div className="text-center">
            <p className="text-5xl font-bold text-white">62</p>
            <p className="mt-1 text-sm text-slate-400">Medium risk</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </GlassCard>

      <FeatureGuard minimumPlan="pro" featureName="Growth Forecasts">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Forecast"
            title="Prophet-style growth projection"
          />
          <ForecastChart />
        </GlassCard>
      </FeatureGuard>

      <FeatureGuard minimumPlan="pro" featureName="Market Signals" className="xl:col-span-2">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Signals"
            title="What the model thinks matters now"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {stockSignals.map((signal) => (
              <div
                key={signal.symbol}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-ai/40 hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-lg font-bold tracking-tight text-white">{signal.symbol}</h4>
                    </div>
                    <Pill tone={signal.signal === "Bullish" ? "profit" : signal.signal === "Bearish" ? "loss" : "neutral"}>
                      {signal.signal}
                    </Pill>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Model Confidence</span>
                      <span className="font-mono text-sm font-bold text-white">{signal.confidence}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 p-0.5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${signal.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] ${
                          signal.signal === "Bullish" ? "bg-profit" : signal.signal === "Bearish" ? "bg-loss" : "bg-ai"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-400 line-clamp-3">
                  {signal.note}
                </p>

                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={12} className="text-ai/50" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </FeatureGuard>
    </section>
  );
}

function StockDetail() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Stock Detail"
          title="TCS real-time view"
          action={<Pill tone="profit">+2.4%</Pill>}
        />

        <div className="mb-6 flex flex-wrap items-end gap-4">
          <h3 className="text-4xl font-bold text-white">₹3,684.20</h3>
          <span className="pb-2 text-sm text-profit">+₹86.40 today</span>
        </div>
        <div className="mb-4 flex gap-2">
          {["1D", "1W", "1M", "1Y"].map((range, index) => (
            <button
              key={range}
              className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-white/10 text-white" : "border border-white/10 text-slate-400"}`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="h-[400px] w-full">
          <CustomChart symbol="TCS" />
        </div>
      </GlassCard>

      <FeatureGuard minimumPlan="elite" featureName="Personal AI Prediction">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Prediction" title="Next movement" />
          <div className="rounded-lg border border-profit/20 bg-profit/10 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Direction</span>
              <Pill tone="profit">UP</Pill>
            </div>
            <p className="mt-4 text-4xl font-bold text-white">81%</p>
            <p className="mt-2 text-sm text-slate-400">Confidence score</p>
          </div>
          <div className="mt-5 space-y-4">
            <Insight
              icon={<Zap size={18} />}
              title="Trend summary"
              text="Price is above short-term moving averages with clean demand follow-through."
            />
            <Insight
              icon={<Gauge size={18} />}
              title="Volume indication"
              text="Volume is 1.4x the 10-day average, suggesting institutional participation."
            />
            <Insight
              icon={<ShieldAlert size={18} />}
              title="Plain-language risk"
              text="Upside remains likely, but position sizing should stay moderate after a fast run."
            />
          </div>
        </GlassCard>
      </FeatureGuard>
    </section>
  );
}

function Insight({ icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <span className="mt-1 text-ai">{icon}</span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function Alerts() {
  return (
    <section id="alerts">
      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Alerts"
          title="Risk, price and opportunity notifications"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Pill tone={alert.tone}>{alert.type}</Pill>
                <Pill tone={alert.status === "Active" ? "ai" : "neutral"}>
                  {alert.status}
                </Pill>
              </div>
              <p className="mt-5 text-base font-semibold text-white">
                {alert.title}
              </p>
              <button className="mt-5 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-ai/40 hover:text-white">
                View action
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
      <div className="fixed bottom-5 right-5 hidden rounded-lg border border-profit/30 bg-profit/10 px-4 py-3 text-sm text-profit shadow-glow backdrop-blur md:block">
        Forecast refreshed. AI confidence improved to 81%.
      </div>
    </section>
  );
}

function AuthModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ai">
              Secure access
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Login to Fintrack
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"
          >
            Close
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-400">Email</span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-ai"
              defaultValue="deepak@fintrack.app"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400">Password</span>
            <input
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-ai"
              type="password"
              defaultValue="mockpass"
            />
          </label>
          <button
            onClick={onClose}
            className="w-full rounded-md bg-ai px-4 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Login with mock account
          </button>
          <p className="text-center text-sm text-slate-500">
            Signup, logout and session state are mocked for the prototype.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function NotificationDrawer({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <motion.aside
        initial={{ x: 360 }}
        animate={{ x: 0 }}
        className="glass ml-auto h-full w-full max-w-sm rounded-none p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"
          >
            Close
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
            >
              <Pill tone={alert.tone}>{alert.type}</Pill>
              <p className="mt-3 font-semibold text-white">{alert.title}</p>
              <p className="mt-1 text-sm text-slate-400">
                {alert.status} alert
              </p>
            </div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
}

function StockMobileExperience() {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-profit">
                INDmoney-style stock page
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Adani Power Ltd
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-white/10 p-2 text-slate-300">
                <Plus size={18} />
              </button>
              <button className="rounded-md border border-white/10 p-2 text-slate-300">
                <Search size={18} />
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="h-[200px] w-full">
              <CustomChart symbol="ADANIPOWER" />
            </div>
          </div>
          <div className="thin-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"].map((range, index) => (
              <button
                key={range}
                className={`shrink-0 rounded-md px-4 py-2 text-sm ${index === 0 ? "bg-white text-midnight" : "border border-white/10 text-slate-300"}`}
              >
                {range}
              </button>
            ))}
            <button className="shrink-0 rounded-md border border-profit/30 px-4 py-2 text-sm text-profit">
              Chart
            </button>
          </div>
        </div>
        <div className="flex border-b border-white/10 px-5">
          {["Overview", "Live", "F&O", "Notes"].map((tab, index) => (
            <button
              key={tab}
              className={`relative px-4 py-4 text-sm ${index === 0 ? "text-white" : "text-slate-400"}`}
            >
              {tab}
              {index === 0 && (
                <span className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-profit" />
              )}
            </button>
          ))}
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold text-white">
            Insights on Adani Power Ltd
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Insights help you understand recent movement of the company's
            critical parameters.
          </p>
          <div className="thin-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
            {companyInsights.map((item) => (
              <div
                key={item.title}
                className="min-w-[260px] rounded-lg border border-profit/40 bg-profit/10 p-4"
              >
                <Pill tone={item.tag === "Watch closely" ? "warn" : "profit"}>
                  {item.tag}
                </Pill>
                <h4 className="mt-5 text-lg font-semibold text-white">
                  {item.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="space-y-5">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Analyst rating"
            title="Based on 7 analysts"
            action={<Pill tone="profit">POSITIVE</Pill>}
          />
          <div className="grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-profit text-2xl font-bold tracking-[0.16em] text-white">
              POSITIVE
            </div>
            <div className="space-y-4">
              {analystRatings.map((rating) => (
                <div
                  key={rating.label}
                  className="grid grid-cols-[1fr_56px_54px] items-center gap-3 text-sm"
                >
                  <div className="h-3 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${rating.value}%`,
                        background: rating.color,
                      }}
                    />
                  </div>
                  <span className="text-slate-300">{rating.value}%</span>
                  <span className="text-slate-400">{rating.label}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Shareholding" title="Shareholding patterns" />
          <div className="mb-4 flex flex-wrap gap-2">
            {["2026", "2025", "2024", "2023", "2022", "2021"].map(
              (year, index) => (
                <button
                  key={year}
                  className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-ai/15 text-ai" : "bg-white/5 text-slate-400"}`}
                >
                  {year}
                </button>
              ),
            )}
          </div>
          <div className="rounded-lg border border-white/10">
            {shareholdingPatterns.map((row) => (
              <div
                key={row.investor}
                className="flex justify-between border-b border-white/10 px-4 py-4 last:border-b-0"
              >
                <span className="text-slate-300">{row.investor}</span>
                <strong className="text-white">{row.holdings}</strong>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 xl:col-span-2">
        <SectionHeader eyebrow="Live" title="Key events for Adani Power Ltd" />
        <div className="thin-scrollbar flex gap-4 overflow-x-auto pb-2">
          {keyEvents.map((event) => (
            <div
              key={event.title}
              className="min-w-[320px] rounded-lg border border-profit/20 bg-profit/10 p-5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-profit text-white">
                <LineChart size={18} />
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-7 text-white">
                {event.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {event.text}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 xl:col-span-2">
        <SectionHeader
          eyebrow="Company"
          title="Company information and sentiment"
        />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm leading-7 text-slate-300">
              Adani Power, a key player in India's power sector, was
              incorporated in 1996 and founded by Gautam Adani. The company is
              headquartered in Ahmedabad, Gujarat.
            </p>
            <div className="mt-5 divide-y divide-white/10 rounded-lg border border-white/10">
              {[
                ["Organization", "Adani Power Ltd"],
                ["HeadQuarters", "-"],
                ["Industry", "Power Generation & Distribution"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 px-4 py-4 text-sm"
                >
                  <span className="text-slate-400">{label}</span>
                  <span className="text-right font-semibold text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-semibold text-white">Market sentiment</h3>
            <div className="mt-4 space-y-3">
              {sentimentDetails.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between border-b border-white/10 pb-3 last:border-b-0"
                >
                  <span className="text-slate-300">{item.label}</span>
                  <strong className="text-white">{item.value}</strong>
                </div>
              ))}
            </div>
            <button className="mt-5 w-full rounded-md border border-ai/30 px-4 py-3 text-ai">
              Hide Details
            </button>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

function WatchlistAndSuggestions() {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <WatchlistPanel
        defaultLayout="list"
        eyebrow="Watchlist"
        title="Track before deciding"
      />

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Suggestions" title="Suggestion history" />
        <div className="space-y-3">
          {suggestionHistory.map((item) => (
            <div
              key={`${item.symbol}-${item.date}`}
              className="grid grid-cols-[110px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4"
            >
              <Pill
                tone={
                  item.type === "RISK ALERT"
                    ? "loss"
                    : item.type === "WATCH"
                      ? "warn"
                      : "profit"
                }
              >
                {item.type}
              </Pill>
              <div>
                <p className="font-semibold text-white">{item.symbol}</p>
                <p className="text-sm text-slate-500">
                  {item.date} · {item.confidence} confidence · {item.trigger}
                </p>
              </div>
              <strong
                className={
                  item.outcome.startsWith("+") ? "text-profit" : "text-loss"
                }
              >
                {item.outcome}
              </strong>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

function SkeletonStrip() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-lg border border-white/10 bg-white/[0.035]"
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [marketIndices, setMarketIndices] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    // Scroll guardian
    window.scrollTo(0, 0);
    const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fintrackApi.getHoldings(),
      fintrackApi.getSummary(),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/market/indices`).then(res => res.json())

    ])
      .then(([hData, sData, mData]) => {
        setHoldings(hData || []);
        setSummary(sData);
        if (mData && mData.success) {
          setMarketIndices(mData.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const allocation = useMemo(() => {
    if (!holdings.length) return [];
    const sectors = holdings.reduce((acc, h) => {
      const sector = h.sector || "Diversified";
      const value = h.qty * (h.currentPrice || h.avgCost);
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    }, {});
    const totalValue = Object.values(sectors).reduce((s, v) => s + v, 0);
    return Object.entries(sectors).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(2))
    })).sort((a, b) => b.value - a.value);
  }, [holdings]);

  const getMarketCap = (symbol) => {
    const s = symbol.toUpperCase().split('.')[0];
    const largeCaps = ["ADANIENT", "ADANIGREEN", "TCS", "HDFCBANK", "RELIANCE", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "BAJFINANCE", "MARUTI", "SUNPHARMA", "KOTAKBANK", "AXISBANK", "ONGC", "NTPC", "TATAMOTORS", "POWERGRID", "ASIANPAINT", "HCLTECH"];
    return largeCaps.includes(s) ? "Large cap" : 
           ["CHOLAFIN", "DIVISLAB", "LTIM", "TVSMOTOR", "DLF", "EICHERMOT", "BAJAJ_AUTO", "TATASTEEL", "CONCOR"].includes(s) ? "Mid cap" : "Small cap";
  };

  const marketCapAllocation = useMemo(() => {
    if (!holdings.length) return [];
    const capGroups = holdings.reduce((acc, h) => {
      const val = h.qty * (h.currentPrice || h.avgCost);
      const cap = getMarketCap(h.symbol);
      acc[cap] = (acc[cap] || 0) + val;
      return acc;
    }, {});
    const totalValue = Object.values(capGroups).reduce((s,v) => s+v, 0);
    const order = ["Large cap", "Mid cap", "Small cap"];
    const colors = { "Large cap": "#4F46E5", "Mid cap": "#818CF8", "Small cap": "#C7D2FE" };
    return Object.entries(capGroups).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(2)),
      color: colors[name] || "#9CA3AF"
    })).sort((a,b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [holdings]);

  const diversificationResult = useMemo(() => {
    if (!holdings.length) {
      return { score: 0, message: "Analyzing...", breakdown: [], issues: [] };
    }
    // Simplistic score for the dashboard
    return {
      score: holdings.length > 5 ? 85 : 45,
      message: holdings.length > 5 ? "Well diversified" : "Concentration risk",
      breakdown: [],
      issues: []
    };
  }, [holdings]);

  const filteredSummary = useMemo(() => {
    if (!holdings.length) return { totalInvestment: 0, currentValue: 0, totalReturns: 0, dayChange: 0, dayChangePercent: 0 };
    const totalInvestment = holdings.reduce((sum, h) => sum + (h.qty * h.avgCost), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.qty * (h.currentPrice || h.avgCost)), 0);
    const totalReturns = currentValue - totalInvestment;
    return {
      totalInvestment,
      currentValue,
      totalReturns,
      dayChange: totalReturns * 0.012, 
      dayChangePercent: 1.2
    };
  }, [holdings]);

  const portfolioPerformance = useMemo(() => {
    if (!filteredSummary?.totalInvestment || filteredSummary.totalInvestment === 0) return 0;
    return (filteredSummary.totalReturns / filteredSummary.totalInvestment) * 100;
  }, [filteredSummary]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-slate-400 mt-1">Your real-time wealth dashboard</p>
      </div>

      <Hero
        summary={filteredSummary}
        isPrivate={isPrivate}
        onTogglePrivacy={() => setIsPrivate(!isPrivate)}
        performance={portfolioPerformance}
      />
      
      <Stats
        summary={filteredSummary}
        isPrivate={isPrivate}
        onTogglePrivacy={() => setIsPrivate(!isPrivate)}
        diversificationResult={diversificationResult}
        performance={portfolioPerformance}
      />

      <section className="grid gap-5 xl:grid-cols-2 mt-6">
        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Market"
            title="Global Indices"
          />
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="text-sm text-slate-500 animate-pulse">Fetching live indices...</div>
            ) : marketIndices.length > 0 ? (
              marketIndices.slice(0, 5).map((idx) => (
                <div key={idx.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{idx.name}</span>
                    <span className="text-xs text-slate-500">{idx.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono">{idx.value}</div>
                    <div className={`text-xs font-medium font-mono ${idx.up ? 'text-profit' : 'text-loss'}`}>
                      {idx.change} ({idx.pointsChange})
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">Market data currently unavailable</div>
            )}
          </div>
        </GlassCard>
        
        <Performance />
      </section>

      <div className="mt-6">
        <GeminiAdvisor 
          holdings={holdings} 
          allocation={allocation} 
          marketCapAllocation={marketCapAllocation}
          summary={filteredSummary}
        />
      </div>
    </AppShell>
  );
}
