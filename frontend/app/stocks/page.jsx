"use client";

import { LineChart, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CandleProxyChart, MobilePriceChart } from "@/components/charts";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
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

export default function StocksPage() {
  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-profit">
          Stock Detail
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          Adani Power Ltd
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Mobile-inspired stock screen with overview, live events, shareholding,
          analyst rating and action controls.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">NSE: ADANIPOWER</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  ₹248.95 <span className="text-base text-profit">+4.2%</span>
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
              <MobilePriceChart />
            </div>
            <div className="thin-scrollbar mt-4 flex gap-2 overflow-x-auto">
              {["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"].map(
                (range, index) => (
                  <button
                    key={range}
                    className={`shrink-0 rounded-md px-4 py-2 text-sm ${index === 0 ? "bg-white text-midnight" : "border border-white/10 text-slate-300"}`}
                  >
                    {range}
                  </button>
                ),
              )}
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
              eyebrow="Candlestick"
              title="Technical chart"
              action={<Pill tone="profit">UP 81%</Pill>}
            />
            <CandleProxyChart />
          </GlassCard>

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
                        className={`px-4 py-3 font-medium ${idx === 0 ? "text-ai" : ""}`}
                      >
                        {year}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {shareholdingPatterns.map((row) => (
                  <tr key={row.investor}>
                    <td className="px-4 py-4 font-medium text-white whitespace-nowrap">
                      {row.investor}
                    </td>
                    {row.values.map((val, idx) => (
                      <td
                        key={idx}
                        className={`px-4 py-4 whitespace-nowrap ${idx === 0 ? "text-white font-medium" : ""}`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Company" title="Company information" />
          <p className="text-sm leading-7 text-slate-300">
            Adani Power, a key player in India's power sector, was incorporated
            in 1996 and founded by Gautam Adani. The company is headquartered in
            Ahmedabad, Gujarat.
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
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
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
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Technicals" title="Technical indicators" />
          <p className="mb-5 text-sm leading-7 text-slate-300">
            {stockTechnicalsDetail.summary}
          </p>
          <div className="divide-y divide-white/10 rounded-lg border border-white/10">
            {stockTechnicalsDetail.metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex justify-between px-4 py-3 text-sm"
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
          <SectionHeader eyebrow="Fundamentals" title="Fundamental data" />
          <div className="space-y-5">
            {stockFundamentalsDetail.groups.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
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
          <SectionHeader eyebrow="Financials" title="Financial statements" />
          <div className="space-y-5">
            {stockFinancialsDetail.groups.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
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
    </AppShell>
  );
}

//hello
