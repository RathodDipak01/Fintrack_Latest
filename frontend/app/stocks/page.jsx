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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      try {
        const [qData, sData] = await Promise.all([
          fintrackApi.getQuote(symbol),
          fintrackApi.getShareholding(symbol)
        ]);
        
        if (qData) setQuote(qData);
        if (sData) setShareholding(sData);
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [symbol]);

  const stockName = quote?.name || "Company Details";
  const currencySymbol = quote?.currency === "INR" ? "₹" : quote?.currency === "USD" ? "$" : "₹";
  const stockPrice = quote?.price ? `${currencySymbol}${quote.price.toLocaleString(quote?.currency === "INR" ? "en-IN" : "en-US")}` : "...";
  const stockChangeRaw = quote?.changeRaw ? quote.changeRaw.toFixed(2) : "0.00";
  const stockChangePct = quote?.changePercent ? quote.changePercent.toFixed(2) : "0.00";
  const isUp = parseFloat(stockChangePct) >= 0;

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          Stock Detail
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          {loading ? "Loading..." : stockName}
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Global market intelligence for {stockName}. Real-time prices, shareholding patterns, and technical analytics.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{quote?.exchange || "Market"}: {symbol}</p>
                <h2 className="mt-1 text-2xl font-semibold text-white flex items-center gap-2">
                  {stockPrice} 
                  {!loading && (
                    <span className={`text-base ${isUp ? "text-profit" : "text-loss"}`}>
                      {stockChangeRaw ? `${isUp ? "+" : ""}${stockChangeRaw} ` : ""}
                      ({isUp ? "+" : ""}{stockChangePct}%)
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/5 transition">
                  <Plus size={18} />
                </button>
                <button className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/5 transition">
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className="mt-5 h-[300px] w-full">
              <CustomChart symbol={symbol} />
            </div>
            <div className="thin-scrollbar mt-4 flex gap-2 overflow-x-auto">
              {["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"].map(
                (range, index) => (
                  <button
                    key={range}
                    className={`shrink-0 rounded-md px-4 py-2 text-sm transition ${index === 0 ? "bg-white text-midnight" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}
                  >
                    {range}
                  </button>
                ),
              )}
              <button className="shrink-0 rounded-md border border-ai/30 px-4 py-2 text-sm text-ai hover:bg-ai hover:text-white transition">
                Chart
              </button>
            </div>
          </div>
          <div className="flex border-b border-white/10 px-5">
            {["Overview", "Live", "F&O", "Notes"].map((tab, index) => (
              <button
                key={tab}
                className={`relative px-4 py-4 text-sm transition ${index === 0 ? "text-white" : "text-slate-400 hover:text-white"}`}
              >
                {tab}
                {index === 0 && (
                  <span className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-ai" />
                )}
              </button>
            ))}
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold text-white">
              Insights on {stockName}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Recent movement and critical parameters analysis for {stockName}.
            </p>
            <div className="thin-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
              {companyInsights.map((item) => (
                <div
                  key={item.title}
                  className="min-w-[260px] rounded-lg border border-ai/40 bg-ai/10 p-4"
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
              eyebrow="Candlestick"
              title="Technical chart"
              action={<Pill tone={isUp ? "profit" : "loss"}>{isUp ? "UP" : "DOWN"} {Math.abs(parseFloat(stockChangePct))}%</Pill>}
            />
            <div className="h-[400px] w-full">
              <CustomChart symbol={symbol} />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeader
              eyebrow="Analyst rating"
              title="Global Sentiment"
              action={<Pill tone={isUp ? "profit" : "loss"}>{isUp ? "POSITIVE" : "NEUTRAL"}</Pill>}
            />
            <div className="grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
              <div className={`grid h-32 w-32 place-items-center rounded-full ${isUp ? "bg-profit" : "bg-ai"} text-xl font-bold tracking-[0.16em] text-white shadow-glow text-center p-2`}>
                {isUp ? "BUY" : "HOLD"}
              </div>
              <div className="space-y-4">
                {analystRatings.map((rating) => (
                  <div
                    key={rating.label}
                    className="grid grid-cols-[1fr_56px_54px] items-center gap-3 text-sm"
                  >
                    <div className="h-3 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${rating.value}%`,
                          background: rating.color,
                        }}
                      />
                    </div>
                    <span className="text-slate-300 font-mono">{rating.value}%</span>
                    <span className="text-slate-400">{rating.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Shareholding" title="Shareholding patterns" />
          <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Investor</th>
                  {["'26", "'25", "'24", "'23", "'22", "'21"].map(
                    (year, idx) => (
                      <th
                        key={year}
                        className={`px-4 py-3 font-medium text-right ${idx === 0 ? "text-ai font-bold" : ""}`}
                      >
                        {year}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(Array.isArray(shareholding) ? shareholding : shareholdingPatterns).map((row) => (
                  <tr key={row.investor} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-4 font-medium text-white whitespace-nowrap">
                      {row.investor}
                    </td>
                    {row.values.map((val, idx) => (
                      <td
                        key={idx}
                        className={`px-4 py-4 text-right font-mono whitespace-nowrap ${idx === 0 ? "text-white font-semibold" : "text-slate-400"}`}
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
          <p className="text-sm leading-7 text-slate-300">
            {stockName} ({symbol}) is a prominent entity listed on the {quote?.exchange || "NSE"}. 
            The company operates in the {quote?.sector || "various"} sector and is a component of major market indices.
          </p>
          <div className="mt-5 divide-y divide-white/10 rounded-lg border border-white/10">
            {[
              ["Organization", stockName],
              ["Symbol", symbol],
              ["Exchange", quote?.exchange || "NSE"],
              ["Sector", quote?.sector || "Equity"],
              ["Currency", quote?.currency || "INR"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 px-4 py-4 text-sm hover:bg-white/[0.02] transition"
              >
                <span className="text-slate-400">{label}</span>
                <span className="text-right font-semibold text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4 border-l-4 border-l-ai">
            <h3 className="font-semibold text-white">Market Sentiment Analysis</h3>
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
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Technicals" title="Momentum Score" />
          <p className="mb-5 text-sm leading-7 text-slate-300">
            Current technical indicators suggest a {isUp ? "Bullish" : "Neutral"} momentum for {symbol} in the short term.
          </p>
          <div className="divide-y divide-white/10 rounded-lg border border-white/10">
            {stockTechnicalsDetail.metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex justify-between px-4 py-3 text-sm hover:bg-white/[0.02] transition"
              >
                <span className="text-slate-400">{metric.label}</span>
                <div className="text-right">
                  <div className="font-semibold text-white">{metric.value}</div>
                  <div className="text-[10px] uppercase text-slate-500">
                    {metric.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Fundamentals" title="Financial Health" />
          <div className="space-y-5">
            {stockFundamentalsDetail.groups.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20"
              >
                <h3 className="mb-3 text-sm font-semibold text-white">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between border-b border-white/10 pb-2 text-sm last:border-b-0 last:pb-0"
                    >
                      <span className="text-slate-300">{row.label}</span>
                      <strong className="text-white">{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Financials" title="Statement Summary" />
          <div className="space-y-5">
            {stockFinancialsDetail.groups.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20"
              >
                <h3 className="mb-3 text-sm font-semibold text-white">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between border-b border-white/10 pb-2 text-sm last:border-b-0 last:pb-0"
                    >
                      <span className="text-slate-300">{row.label}</span>
                      <strong className="text-white">{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Live" title={`Events for ${stockName}`} />
        <div className="thin-scrollbar flex gap-4 overflow-x-auto pb-2">
          {keyEvents.map((event) => (
            <div
              key={event.title}
              className="min-w-[320px] rounded-lg border border-ai/20 bg-ai/10 p-5 hover:scale-[1.02] transition"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-ai text-white shadow-glow">
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
    </AppShell>
  );
}
