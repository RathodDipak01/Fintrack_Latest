"use client";

import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { AllocationChart } from "@/components/charts";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader, StatCard } from "@/components/ui";
import { fintrackApi } from "@/lib/api";

export default function PortfolioPage() {
  const [sortField, setSortField] = useState("symbol");
  const [sortDirection, setSortDirection] = useState("asc");
  const [liveHoldings, setLiveHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allocation, setAllocation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    Promise.all([
      fintrackApi.getHoldings(),
      fintrackApi.getSummary(),
      fintrackApi.getAllocation(),
    ])
      .then(([hData, sData, aData]) => {
        const mapped = (hData || []).map((h) => ({
          ...h,
          avg: h.avgCost,
          price: h.currentPrice,
          change: h.changePercent,
          pnl: String(h.pnl),
          productType: h.productType || "CNC",
        }));
        setLiveHoldings(mapped);
        setSummary(sData);
        setAllocation(aData || []);
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
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedHoldings = useMemo(() => {
    return [...liveHoldings].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      const parseNum = (val) => {
        if (typeof val === "number") return val;
        return parseFloat(val.replace(/[^\d.-]/g, ""));
      };

      if (["qty", "avg", "price", "change", "pnl"].includes(sortField)) {
        valA = parseNum(valA);
        valB = parseNum(valB);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortField, sortDirection]);

  const renderHeader = (label, field) => (
    <th
      className="cursor-pointer px-3 py-2 transition hover:bg-white/5"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
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
        <p className="mt-4 max-w-3xl text-slate-400">
          Track holdings with mock data for portfolio analysis, alerts and AI
          suggestions. This is a decision-support app only. Connect{" "}
          <Link
            href="/import"
            className="text-ai underline-offset-2 hover:underline"
          >
            Angel One, Zerodha, Groww, Upstox
          </Link>{" "}
          or{" "}
          <Link
            href="/import"
            className="text-ai underline-offset-2 hover:underline"
          >
            import a CSV
          </Link>{" "}
          to analyze your real positions.
        </p>
        <Link
          href="/import"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-ai/40 bg-ai/10 px-4 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white"
        >
          <Upload size={16} />
          Import or connect broker
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total investment"
          value={`₹${(summary?.totalInvestment || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+0%"
          isPrivate={isPrivate}
          onTogglePrivacy={() => setIsPrivate(!isPrivate)}
          showPrivacyToggle
        />
        <StatCard
          label="Current value"
          value={`₹${(summary?.currentValue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+0%"
          tone="profit"
          isPrivate={isPrivate}
          onTogglePrivacy={() => setIsPrivate(!isPrivate)}
          showPrivacyToggle
        />
        <StatCard
          label="Unrealized P&L"
          value={`₹${(summary?.totalReturns || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+0%"
          tone="ai"
          isPrivate={isPrivate}
          onTogglePrivacy={() => setIsPrivate(!isPrivate)}
          showPrivacyToggle
        />
        <StatCard
          label="Holdings"
          value={String(liveHoldings.length)}
          change={isLoading ? "Loading..." : "Live"}
          tone="warn"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard className="overflow-hidden p-6">
          <SectionHeader
            eyebrow="Holdings"
            title="Stocks in portfolio"
            action={
              <div className="flex flex-wrap gap-2">
                <button className="rounded-md bg-ai px-3 py-2 text-sm font-semibold text-white">
                  <Plus size={14} className="mr-1 inline" /> Add to watchlist
                </button>
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
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  {renderHeader("Stock", "symbol")}
                  {renderHeader("Qty", "qty")}
                  {renderHeader("Avg cost", "avg")}
                  {renderHeader("Current", "price")}
                  {renderHeader("Type", "productType")}
                  {renderHeader("% Change", "change")}
                  {renderHeader("Total P&L", "pnl")}
                  <th className="px-3 py-2">Actions</th>
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
                      key={stock.symbol}
                      className="rounded-lg bg-white/[0.035] text-sm text-slate-300 transition hover:bg-white/[0.07]"
                    >
                      <td className="rounded-l-lg px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-md bg-panel2 font-semibold text-white">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {stock.symbol}
                            </p>
                            <p className="text-xs text-slate-500">
                              {stock.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">{stock.qty}</td>
                      <td className="px-3 py-4">
                        {isPrivate ? "••••" : `₹${stock.avg}`}
                      </td>
                      <td className="px-3 py-4">
                        {isPrivate ? "••••" : `₹${stock.price}`}
                      </td>
                      <td className="px-3 py-4 text-xs font-semibold">
                        <span
                          className={`rounded px-2 py-1 ${stock.productType === "MIS" ? "bg-orange-500/10 text-orange-400" : "bg-green-500/10 text-green-400"}`}
                        >
                          {stock.productType}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-4 font-semibold ${stock.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {stock.change}%
                      </td>
                      <td
                        className={`px-3 py-4 font-semibold ${stock.pnl.startsWith("-") ? "text-loss" : "text-profit"}`}
                      >
                        {isPrivate ? "••••" : `₹${stock.pnl}`}
                      </td>
                      <td className="rounded-r-lg px-3 py-4">
                        <div className="flex gap-2">
                          <button className="rounded-md border border-white/10 px-2 py-1 text-xs">
                            Edit
                          </button>
                          <button className="rounded-md border border-loss/30 px-2 py-1 text-xs text-loss">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader
            eyebrow="Allocation"
            title="Sector breakdown"
            action={
              <Pill tone="warn">{summary?.diversification || "Analyzing"}</Pill>
            }
          />
          <AllocationChart />
          <div className="space-y-3">
            {allocation.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-ai"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </AppShell>
  );
}
