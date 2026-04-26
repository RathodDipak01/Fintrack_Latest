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

  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      try {
        const [qData, sData, gData] = await Promise.all([
          fintrackApi.getQuote(symbol).catch(() => null),
          fintrackApi.getShareholding(symbol).catch(() => null),
          fintrackApi.getGrowwData(symbol).catch(() => null)
        ]);
        
        if (qData) setQuote(qData);
        if (sData) setShareholding(sData);
        if (gData) setGrowwData(gData);
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [symbol]);

  const stockName = growwData?.details?.fullName || quote?.name || "Company Details";
  const currencySymbol = quote?.currency === "INR" ? "₹" : quote?.currency === "USD" ? "$" : "₹";
  const stockPrice = quote?.price ? `${currencySymbol}${quote.price.toLocaleString(quote?.currency === "INR" ? "en-IN" : "en-US")}` : "...";
  const stockChangeRaw = quote?.changeRaw ? quote.changeRaw.toFixed(2) : "0.00";
  const stockChangePct = quote?.changePercent ? quote.changePercent.toFixed(2) : "0.00";
  const isUp = parseFloat(stockChangePct) >= 0;

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
                {stockPrice} 
                {!loading && (
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
            <div className="flex gap-3">
              <button className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm">
                <Plus size={20} />
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm">
                <Search size={20} />
              </button>
            </div>
          </div>
          
          <div className="h-[500px] w-full rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0a]">
            <CustomChart symbol={symbol} />
          </div>

          <div className="thin-scrollbar mt-6 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex gap-2">
              {["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"].map(
                (range, index) => (
                  <button
                    key={range}
                    className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${index === 0 ? "bg-white text-midnight shadow-lg scale-105" : "border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    {range}
                  </button>
                ),
              )}
            </div>
            <button className="shrink-0 rounded-lg border border-ai/30 bg-ai/10 px-6 py-2.5 text-sm font-bold text-ai hover:bg-ai hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              Advanced Chart
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Financial Performance Section */}
      <GlassCard className="p-8 mb-6">
        <SectionHeader eyebrow="Performance" title="Financial Performance" />
        <p className="mt-2 text-slate-400 mb-8">Consolidated Revenue, Profit, and Net Worth trends (₹ in Crores).</p>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {(growwData?.financialStatementV2?.CONSOLIDATED || []).map((metric) => (
            <div key={metric.title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                {metric.title}
                <span className="text-[10px] text-ai font-black uppercase tracking-widest bg-ai/10 px-2 py-1 rounded">Yearly</span>
              </h4>
              
              <div className="flex items-end gap-2 h-32 mb-6">
                {Object.entries(metric.yearly || {}).slice(-5).map(([year, value]) => {
                  const values = Object.values(metric.yearly);
                  const max = Math.max(...values);
                  const height = (value / max) * 100;
                  return (
                    <div key={year} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-700 ${metric.title === 'Profit' ? 'bg-profit' : metric.title === 'Revenue' ? 'bg-ai' : 'bg-white/40'} group-hover:brightness-125`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-midnight border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          ₹{value.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{year}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3 border-t border-white/5 pt-4">
                {Object.entries(metric.yearly || {}).slice(-3).reverse().map(([year, value]) => (
                  <div key={year} className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{year}</span>
                    <span className="text-white font-mono font-bold">₹{value.toLocaleString('en-IN')} Cr</span>
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
            <p className="mt-2 text-slate-400">Valuation and efficiency analysis.</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-ai/20 bg-ai/5 p-6 hover:bg-ai/10 transition-all group">
            <div className="flex justify-between items-start">
              <Pill tone="profit">Valuation</Pill>
            </div>
            <h4 className="mt-6 text-xl font-bold text-white group-hover:text-ai transition-colors">Pricing Metrics</h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="text-white font-mono font-bold">{growwData?.stats?.peRatio || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Industry P/E</span>
                <span className="text-white font-mono">{growwData?.stats?.industryPe?.toFixed(2) || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">P/B Ratio</span>
                <span className="text-white font-mono">{growwData?.stats?.pbRatio || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-profit/20 bg-profit/5 p-6 hover:bg-profit/10 transition-all group">
            <Pill tone="profit">Efficiency</Pill>
            <h4 className="mt-6 text-xl font-bold text-white group-hover:text-profit transition-colors">Return Profile</h4>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ROE</span>
                <span className="text-profit font-mono font-bold">{growwData?.stats?.roe?.toFixed(2) || "N/A"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Div. Yield</span>
                <span className="text-white font-mono">{growwData?.stats?.divYield?.toFixed(2) || "N/A"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Book Value</span>
                <span className="text-white font-mono">₹{growwData?.stats?.bookValue?.toFixed(2) || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all group">
            <Pill tone="warn">Analyst Rating</Pill>
            <h4 className="mt-6 text-xl font-bold text-white">Global Sentiment</h4>
            <div className="mt-4 flex items-center gap-6">
              <div className={`grid h-16 w-16 place-items-center rounded-full ${isUp ? "bg-profit/20 text-profit border border-profit/50" : "bg-ai/20 text-ai border border-ai/50"} text-sm font-black shadow-glow`}>
                {isUp ? "BUY" : "HOLD"}
              </div>
              <div className="flex-1 space-y-2">
                {analystRatings.slice(0, 2).map((rating) => (
                  <div key={rating.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                      <span>{rating.label}</span>
                      <span>{rating.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${rating.value}%`, background: rating.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Shareholding" title="Ownership structure" />
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-bold uppercase tracking-tighter text-[10px]">Investor</th>
                  {(shKeys.length > 0 ? shKeys : ["'26", "'25", "'24", "'23", "'22", "'21"]).map(
                    (year, idx) => (
                      <th
                        key={year}
                        className={`px-4 py-4 font-bold text-right ${idx === 0 ? "text-ai" : ""}`}
                      >
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
                      <td
                        key={idx}
                        className={`px-4 py-4 text-right font-mono whitespace-nowrap ${idx === 0 ? "text-white font-bold" : "text-slate-500"}`}
                      >
                        {val}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Company" title="Entity Profile" />
          <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <p className="text-sm leading-7 text-slate-400 italic">
              "{growwData?.details?.businessSummary || `${stockName} (${symbol}) is a prominent entity listed on the ${quote?.exchange || "NSE"}.`}"
            </p>
          </div>
          <div className="mt-6 space-y-1">
            {[
              ["Organization", stockName],
              ["CEO", growwData?.details?.ceo || "N/A"],
              ["Founded", growwData?.details?.foundedYear || "N/A"],
              ["Headquarters", growwData?.details?.headquarters || "N/A"],
              ["Industry", growwData?.header?.industryName || quote?.sector || "Equity"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center px-4 py-4 text-sm rounded-lg hover:bg-white/[0.04] transition-all"
              >
                <span className="text-slate-500 font-medium">{label}</span>
                <span className="text-right font-bold text-white truncate max-w-[240px]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2 mt-6">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Technicals" title="Health Indicators" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            {growwData?.stats ? (
              [
                { label: "Market Cap", value: `₹${growwData.stats.marketCap.toLocaleString('en-IN')} Cr` },
                { label: "ROE", value: `${growwData.stats.roe}%` },
                { label: "EPS (TTM)", value: `₹${growwData.stats.epsTtm}` },
                { label: "Debt/Equity", value: growwData.stats.debtToEquity },
                { label: "Current Ratio", value: growwData.stats.currentRatio },
                { label: "Book Value", value: `₹${growwData.stats.bookValue}` },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="block text-[10px] uppercase font-black text-slate-600 mb-1">{metric.label}</span>
                  <span className="text-lg font-bold text-white">{metric.value}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-slate-500">Loading metrics...</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Fundamentals" title="Balance Sheet & Key Metrics" />
          <div className="mt-6 space-y-2 overflow-y-auto max-h-[350px] pr-2 thin-scrollbar">
            {growwData?.fundamentals ? (
              growwData.fundamentals.map((metric) => (
                <div key={metric.name} className="flex justify-between items-center px-4 py-3 text-sm rounded-lg hover:bg-white/[0.04] transition-all border-b border-white/5 last:border-0">
                  <span className="text-slate-500 font-medium">{metric.name}</span>
                  <span className="font-mono font-bold text-white">{metric.value}</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">Loading fundamentals...</div>
            )}
          </div>
        </GlassCard>
      </section>

      <div className="mt-6">
        <GlassCard className="p-8">
          <SectionHeader eyebrow="Live" title={`Events & Corporate Actions`} />
          <div className="thin-scrollbar flex gap-6 overflow-x-auto pb-4 mt-6">
            {keyEvents.map((event) => (
              <div
                key={event.title}
                className="min-w-[340px] rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-ai/40 transition-all hover:-translate-y-1"
              >
                <div className="h-10 w-10 rounded-xl bg-ai/20 flex items-center justify-center text-ai shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <LineChart size={20} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">
                  {event.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {event.text}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
