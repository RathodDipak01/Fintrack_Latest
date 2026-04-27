"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import TradingViewWidget, { formatTvSymbol } from "@/components/tradingview-widget";
import CustomChart from "@/components/custom-chart";
import {
  analystRatings,
  companyInsights,
  keyEvents,
  sentimentDetails,
  shareholdingPatterns,
  stockTechnicalsDetail,
  stockFundamentalsDetail,
  stockFinancialsDetail,
} from "@/lib/portfolio-data";

import { fintrackApi } from "@/lib/api";

export default function StocksPage() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "ADANIPOWER.NS";

  const [quote, setQuote] = useState(null);
  const [shareholding, setShareholding] = useState(null);
  const [growwData, setGrowwData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [newsFilter, setNewsFilter] = useState("all"); // all, positive, negative

  useEffect(() => {
    let isMounted = true;
    
    async function fetchAll() {
      setLoading(true);
      try {
        const [qData, sData, gData] = await Promise.all([
          fintrackApi.getQuote(symbol).catch(() => null),
          fintrackApi.getShareholding(symbol).catch(() => null),
          fintrackApi.getGrowwData(symbol).catch(() => null)
        ]);

        if (isMounted) {
          if (qData) setQuote(qData);
          if (sData) setShareholding(sData);
          if (gData) setGrowwData(gData);
        }
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchAll();

    // Only poll the quote (live price) every 10 seconds, not the heavy fundamental data
    const interval = setInterval(async () => {
      try {
        const qData = await fintrackApi.getQuote(symbol);
        if (isMounted && qData) setQuote(qData);
      } catch (err) {
        // Silent fail for polling
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const stockName = growwData?.details?.fullName || quote?.name || "Company Details";
  const currencySymbol = quote?.currency === "INR" ? "₹" : quote?.currency === "USD" ? "$" : "₹";
  const stockPrice = quote?.price ? `${currencySymbol}${quote.price.toLocaleString(quote?.currency === "INR" ? "en-IN" : "en-US")}` : "";
  const stockChangeRaw = quote?.changeRaw ? quote.changeRaw.toFixed(2) : null;
  const stockChangePct = quote?.changePercent ? quote.changePercent.toFixed(2) : null;
  const isUp = stockChangePct ? parseFloat(stockChangePct) >= 0 : true;

  // Process Groww Shareholding
  const shKeys = growwData?.shareHoldingPattern ? Object.keys(growwData.shareHoldingPattern).reverse().slice(0, 6) : [];
  const shRows = growwData?.shareHoldingPattern ? [
    { investor: "Promoter", values: shKeys.map(k => growwData.shareHoldingPattern[k]?.promoters?.individual?.percent?.toFixed(2) || "0.00") },
    { investor: "FII", values: shKeys.map(k => growwData.shareHoldingPattern[k]?.foreignInstitutions?.percent?.toFixed(2) || "0.00") },
    { investor: "DII", values: shKeys.map(k => growwData.shareHoldingPattern[k]?.otherDomesticInstitutions?.insurance?.percent?.toFixed(2) || "0.00") },
    { investor: "Mutual Funds", values: shKeys.map(k => growwData.shareHoldingPattern[k]?.mutualFunds?.percent?.toFixed(2) || "0.00") },
    { investor: "Retail & Others", values: shKeys.map(k => growwData.shareHoldingPattern[k]?.retailAndOthers?.percent?.toFixed(2) || "0.00") }
  ] : null;

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {growwData?.logoUrl && (
            <img src={growwData.logoUrl} alt={stockName} className="w-14 h-14 rounded-full object-contain bg-white p-1 shadow-glow" />
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
              Market Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl tracking-tight">
              {loading ? "Loading..." : stockName}
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-slate-400 leading-relaxed">
          {growwData?.details?.businessSummary?.split('.')[0]}. Real-time prices, shareholding patterns, and technical analytics.
        </p>
      </div>

      {/* Main Chart Section - Full Width */}
      <GlassCard className="overflow-hidden p-0 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{quote?.exchange || "NSE"}: {symbol}</p>
              <h2 className="mt-1 text-3xl font-bold text-white flex items-center gap-3">
                {stockPrice || (loading ? "Loading..." : "")}
                {!loading && stockChangePct && (
                  <span className={`text-lg font-semibold ${isUp ? "text-profit" : "text-loss"}`}>
                    {stockChangeRaw ? `${isUp ? "+" : ""}${stockChangeRaw} ` : ""}
                    ({isUp ? "+" : ""}{stockChangePct}%)
                  </span>
                )}
              </h2>
              {quote?.volume && (
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Volume: <span className="text-slate-300">{quote.volume.toLocaleString('en-IN')}</span>
                </p>
              )}
            </div>
          </div>

          <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <TradingViewWidget symbol={formatTvSymbol(symbol)} />
          </div>
        </div>
      </GlassCard>

      {/* Financial Performance Section */}
      <GlassCard className="p-8 mb-6">
        <SectionHeader eyebrow="Performance" title="Financial Performance" />
        <p className="mt-2 text-slate-400 mb-8">
          Consolidated Revenue, Profit, and Net Worth trends (₹ in Crores).
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          {(growwData?.financialStatementV2?.CONSOLIDATED || []).map((metric) => (
            <div
              key={metric.title}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all"
            >
              <h4 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                {metric.title}
                <span className="text-[10px] text-ai font-black uppercase tracking-widest bg-ai/10 px-2 py-1 rounded">
                  Yearly
                </span>
              </h4>

              {/* Chart */}
              <div className="relative flex items-end gap-2 h-32 mb-6 px-2">
                {/* Y-Axis Grid/Scale */}
                <div className="absolute inset-x-0 h-full flex flex-col justify-between pointer-events-none border-l border-white/5">
                  <div className="w-full border-t border-white/[0.03]" />
                  <div className="w-full border-t border-white/[0.03]" />
                  <div className="w-full border-t border-white/[0.03]" />
                </div>

                {(Object.entries(metric.yearly || {}).slice(-5) || []).map(
                  ([year, rawValue]) => {
                    const value = Number(rawValue);
                    const values = Object.values(metric.yearly).map((v) =>
                      Number(v)
                    );
                    const max = Math.max(...values) || 1;

                    const height = Math.max((value / max) * 100, 5);

                    const barColor =
                      metric.title === "Profit"
                        ? "#22C55E"
                        : metric.title === "Revenue"
                          ? "#3B82F6"
                          : "#94a3b8";

                    return (
                      <div
                        key={year}
                        className="flex-1 flex flex-col items-center justify-end gap-2 group min-w-[30px] h-full z-10"
                      >
                        {/* Bar container */}
                        <div className="w-full relative h-full flex items-end overflow-visible">
                          {/* Bar */}
                          <div
                            className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-125 origin-bottom shadow-[0_0_15px_rgba(0,0,0,0.2)]"

                            style={{
                              height: `${height}%`,
                              backgroundColor: barColor,
                              opacity: 0.8,
                            }}
                          />

                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ai border border-ai/50 px-2 py-1 rounded-lg text-[10px] font-black text-white opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all z-20 whitespace-nowrap pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            ₹{value.toLocaleString("en-IN")}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ai" />
                          </div>
                        </div>

                        {/* Year */}
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-white transition-colors">
                          {year}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Bottom values */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                {Object.entries(metric.yearly || {})
                  .slice(-3)
                  .reverse()
                  .map(([year, value]) => (
                    <div key={year} className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">{year}</span>
                      <span className="text-white font-mono font-bold">
                        ₹{value.toLocaleString("en-IN")} Cr
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Insights Section */}
      <GlassCard className="p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionHeader
              eyebrow="Intelligence"
              title={`Key Ratios`}
            />
            <p className="mt-2 text-slate-400">
              Valuation and efficiency analysis.
            </p>
          </div>
        </div>

        {/* Changed grid layout */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Valuation */}
          <div className="rounded-2xl border border-ai/20 bg-ai/5 p-6 hover:bg-ai/10 transition-all group h-full">
            <div className="flex justify-between items-start">
              <Pill tone="profit">Valuation</Pill>
            </div>

            <h4 className="mt-6 text-xl font-bold text-white group-hover:text-ai transition-colors">
              Pricing Metrics
            </h4>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="text-white font-mono font-bold">
                  {growwData?.stats?.peRatio || "N/A"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Industry P/E</span>
                <span className="text-white font-mono">
                  {growwData?.stats?.industryPe?.toFixed(2) || "N/A"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">P/B Ratio</span>
                <span className="text-white font-mono">
                  {growwData?.stats?.pbRatio || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Efficiency */}
          <div className="rounded-2xl border border-profit/20 bg-profit/5 p-6 hover:bg-profit/10 transition-all group h-full">
            <Pill tone="profit">Efficiency</Pill>

            <h4 className="mt-6 text-xl font-bold text-white group-hover:text-profit transition-colors">
              Return Profile
            </h4>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ROE</span>
                <span className="text-profit font-mono font-bold">
                  {growwData?.stats?.roe?.toFixed(2) || "N/A"}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Div. Yield</span>
                <span className="text-white font-mono">
                  {growwData?.stats?.divYield?.toFixed(2) || "N/A"}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Book Value</span>
                <span className="text-white font-mono">
                  ₹{growwData?.stats?.bookValue?.toFixed(2) || "N/A"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </GlassCard>

      {/* Ownership & Entity Row */}
      <section className="grid gap-6 xl:grid-cols-3 mb-6">
        <GlassCard className="p-6 xl:col-span-2">
          <SectionHeader eyebrow="Ownership" title="Shareholding Structure" />
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-bold uppercase tracking-tighter text-[10px]">Investor</th>
                  {(shKeys.length > 0 ? shKeys : ["'26", "'25", "'24", "'23", "'22", "'21"]).map(
                    (year, idx) => (
                      <th key={year} className={`px-4 py-4 font-bold text-right ${idx === 0 ? "text-ai" : ""}`}>
                        {year}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(shRows || (Array.isArray(shareholding) ? shareholding : shareholdingPatterns)).map((row) => (
                  <tr key={row.investor} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-5 py-4 font-semibold text-white whitespace-nowrap group-hover:text-ai transition-colors">
                      {row.investor}
                    </td>
                    {row.values.map((val, idx) => (
                      <td key={idx} className={`px-4 py-4 text-right font-mono whitespace-nowrap ${idx === 0 ? "text-white font-bold" : "text-slate-500"}`}>
                        {val}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col">
          <SectionHeader eyebrow="Profile" title="Entity Details" />
          <div className="mt-6 space-y-1 flex-1">
            {[
              ["CEO", growwData?.details?.ceo || "N/A"],
              ["Founded", growwData?.details?.foundedYear || "N/A"],
              ["HQ", growwData?.details?.headquarters || "N/A"],
              ["Industry", growwData?.header?.industryName || quote?.sector || "Equity"],
              ["Mkt Cap", growwData?.stats?.marketCap ? `₹${growwData.stats.marketCap.toLocaleString('en-IN')} Cr` : "N/A"],
              ["Rank", growwData?.stats?.marketCapRank ? `#${growwData.stats.marketCapRank}` : "N/A"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center px-4 py-3 text-sm rounded-lg hover:bg-white/[0.04] transition-all border-b border-white/5 last:border-0">
                <span className="text-slate-500 font-medium">{label}</span>
                <span className="text-right font-bold text-white truncate max-w-[150px]">{value}</span>
              </div>
            ))}
          </div>
          <div
            className="mt-6 p-4 rounded-xl bg-ai/5 border border-ai/10 cursor-pointer hover:bg-ai/10 transition-all group"
            onClick={() => setExpandedSummary(!expandedSummary)}
          >
            <p className={`text-[11px] leading-relaxed text-slate-400 italic transition-all duration-500 ${expandedSummary ? "" : "line-clamp-4"}`}>
              "{growwData?.details?.businessSummary || "No detailed business summary available for this entity."}"
            </p>
            <div className="mt-2 text-[9px] font-black text-ai uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {expandedSummary ? "Click to Collapse" : "Click to Read More"} <Search size={8} />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Intelligence & Technicals Row */}
      <section className="grid gap-6 xl:grid-cols-3 mb-6 items-stretch">
        <GlassCard className="p-6 h-full flex flex-col">
          <SectionHeader eyebrow="Performance" title="Market Range" />
          <div className="mt-6 flex-1 space-y-6 flex flex-col justify-center">
            {/* Today's Range */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                <span>Today's Low</span>
                <span>Today's High</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white mb-2">
                <span>₹{quote?.dayLow?.toLocaleString('en-IN') || "N/A"}</span>
                <span>₹{quote?.dayHigh?.toLocaleString('en-IN') || "N/A"}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full bg-ai shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                  style={{
                    left: `${((quote?.price - quote?.dayLow) / (quote?.dayHigh - quote?.dayLow)) * 100}%`,
                    width: '4px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>

            {/* 52W Range */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
                <span>52W Low</span>
                <span>52W High</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white mb-2">
                <span>₹{quote?.fiftyTwoWeekLow?.toLocaleString('en-IN') || "N/A"}</span>
                <span>₹{quote?.fiftyTwoWeekHigh?.toLocaleString('en-IN') || "N/A"}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full bg-profit shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                  style={{
                    left: `${((quote?.price - quote?.fiftyTwoWeekLow) / (quote?.fiftyTwoWeekHigh - quote?.fiftyTwoWeekLow)) * 100}%`,
                    width: '4px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>

            {/* Open/Close */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Open</span>
                <div className="text-sm font-bold text-white mt-0.5">₹{quote?.open?.toLocaleString('en-IN') || "N/A"}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Prev Close</span>
                <div className="text-sm font-bold text-white mt-0.5">₹{quote?.prevClose?.toLocaleString('en-IN') || "N/A"}</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 h-full flex flex-col">
          <SectionHeader eyebrow="Valuation" title="Pricing Intelligence" />
          <div className="mt-6 space-y-4 flex-1">
            {[
              { label: "P/E Ratio", value: growwData?.stats?.peRatio, industry: growwData?.stats?.industryPe },
              { label: "P/B Ratio", value: growwData?.stats?.pbRatio, industry: growwData?.stats?.sectorPb },
              { label: "EV/EBITDA", value: growwData?.stats?.evToEbitda, industry: "N/A" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-500">{item.label}</span>
                    <div className="text-xl font-bold text-white mt-1">{item.value || "N/A"}</div>
                  </div>
                  {item.industry && item.industry !== "N/A" && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-600">Industry Avg</span>
                      <div className="text-sm font-bold text-ai">{typeof item.industry === 'number' ? item.industry.toFixed(2) : item.industry}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 h-full flex flex-col">
          <SectionHeader eyebrow="Efficiency" title="Health Indicators" />
          <div className="mt-6 grid grid-cols-2 gap-4 flex-1">
            {[
              { label: "ROE", value: growwData?.stats?.roe ? `${Number(growwData.stats.roe).toFixed(2)}%` : null, tone: "profit" },
              { label: "ROCE", value: growwData?.fundamentals?.find(f => f.name.includes("ROCE"))?.value || (growwData?.stats?.sectorRoce ? `${Number(growwData.stats.sectorRoce).toFixed(2)}%` : null), tone: "ai" },
              { label: "Debt/Equity", value: typeof growwData?.stats?.debtToEquity === 'number' ? growwData.stats.debtToEquity.toFixed(2) : growwData?.stats?.debtToEquity, tone: "warn" },
              { label: "Current Ratio", value: typeof growwData?.stats?.currentRatio === 'number' ? growwData.stats.currentRatio.toFixed(2) : growwData?.stats?.currentRatio, tone: "ai" },
              { label: "EPS (TTM)", value: growwData?.stats?.epsTtm ? `₹${Number(growwData.stats.epsTtm).toFixed(2)}` : null, tone: "white" },
              { label: "Div Yield", value: growwData?.stats?.divYield ? `${Number(growwData.stats.divYield).toFixed(2)}%` : null, tone: "profit" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-center">
                <span className="text-[10px] uppercase font-black text-slate-600">{item.label}</span>
                <div className={`text-lg font-bold mt-1 ${item.tone === 'profit' ? 'text-profit' : item.tone === 'ai' ? 'text-ai' : item.tone === 'warn' ? 'text-warn' : 'text-white'}`}>
                  {item.value || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Balance Sheet Row */}
      <div className="mb-6">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Fundamentals" title="Balance Sheet" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {growwData?.fundamentals?.slice(0, 8).map((metric) => (
              <div key={metric.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{metric.name}</span>
                <div className="text-sm font-bold text-white mt-1 font-mono">{metric.value}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-8">
        <GlassCard className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <SectionHeader eyebrow="Live Feed" title={`Market Intelligence & News`} />
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 self-start md:self-auto">
              {['all', 'positive', 'negative'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setNewsFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    newsFilter === filter 
                      ? 'bg-ai text-white shadow-glow' 
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {filter === 'all' ? 'All Coverage' : filter === 'positive' ? 'Bullish (Positive)' : 'Bearish (Negative)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(growwData?.news?.length > 0 ? growwData.news : keyEvents)
              .filter(event => newsFilter === 'all' || event.sentiment === newsFilter)
              .map((event, idx) => {
              const thumbnail = event.thumbnail?.resolutions?.[0]?.url;
              const sentimentColor = event.sentiment === 'positive' ? 'text-profit' : event.sentiment === 'negative' ? 'text-loss' : 'text-ai';
              const sentimentBg = event.sentiment === 'positive' ? 'bg-profit/10' : event.sentiment === 'negative' ? 'bg-loss/10' : 'bg-ai/10';
              const sentimentLabel = event.sentiment === 'positive' ? 'Bullish' : event.sentiment === 'negative' ? 'Bearish' : 'Neutral';

              return (
                <div
                  key={event.uuid || idx}
                  className={`flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-ai/40 transition-all hover:-translate-y-1 group shadow-lg ${
                    event.sentiment === 'positive' ? 'hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 
                    event.sentiment === 'negative' ? 'hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]' : ''
                  }`}
                >
                  {thumbnail && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={thumbnail} alt={event.title} className="w-full h-full object-cover transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight to-transparent opacity-60" />
                      <div className={`absolute top-4 right-4 ${sentimentBg} backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black ${sentimentColor} shadow-lg border border-white/10`}>
                        {sentimentLabel}
                      </div>
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white">
                        {event.publisher || "NEWS"}
                      </div>
                    </div>
                  )}

                  <div className={`p-6 flex flex-col flex-1 ${!thumbnail ? "border-t-4 border-ai/40" : ""}`}>
                    {!thumbnail && (
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${sentimentBg} ${sentimentColor} px-2 py-0.5 rounded border border-white/5`}>
                          {sentimentLabel}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {event.publisher || "Update"}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        {event.providerPublishTime ? new Date(event.providerPublishTime * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug line-clamp-3 group-hover:text-ai transition-colors mb-3">
                      {event.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-400 line-clamp-3 mb-6">
                      {event.summary || event.text || "Latest market coverage and analyst insights regarding recent corporate developments and sector movements."}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-md ${sentimentBg} flex items-center justify-center text-[10px] font-bold ${sentimentColor} uppercase`}>
                          {(event.publisher || "M")?.[0]}
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[100px]">
                          {event.publisher || "Market Source"}
                        </span>
                      </div>

                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[11px] font-bold text-white hover:bg-ai hover:border-ai transition-all"
                      >
                        READ MORE <Search size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {((growwData?.news?.length > 0 ? growwData.news : keyEvents).filter(e => newsFilter === 'all' || e.sentiment === newsFilter).length === 0) && (
            <div className="mt-8 text-center p-12 rounded-3xl border border-dashed border-white/10 text-slate-500">
              No {newsFilter} news found for this period. Try switching filters.
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
