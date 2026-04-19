"use client";

import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader, StatCard } from "@/components/ui";
import { suggestionHistory } from "@/lib/portfolio-data";

export default function SuggestionsPage() {
  const total = suggestionHistory.length;
  const positiveOutcomes = suggestionHistory.filter((s) => s.outcome.startsWith("+")).length;
  const riskWarnings = suggestionHistory.filter((s) => s.type === "RISK ALERT").length;

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-profit">Suggestions</p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">Suggestion history</h1>
        <p className="mt-4 max-w-3xl text-slate-400">A history of AI suggestions, confidence levels, triggers and follow-up outcomes. This app does not place orders.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total suggestions" value={String(total)} change="Mock" tone="ai" />
        <StatCard label="Positive outcomes" value={String(positiveOutcomes)} change="By outcome" tone="profit" />
        <StatCard label="Risk warnings" value={String(riskWarnings)} change="Needs review" tone="loss" />
      </section>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Ledger" title="Recent recommendations" />
        <div className="space-y-3">
          {suggestionHistory.map((item) => (
            <div key={`${item.symbol}-${item.date}`} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[110px_1fr_auto] sm:items-center">
              <Pill tone={item.type === "RISK ALERT" ? "loss" : item.type === "WATCH" ? "warn" : "profit"}>{item.type}</Pill>
              <div>
                <p className="font-semibold text-white">{item.symbol}</p>
                <p className="text-sm text-slate-500">{item.date} · {item.confidence} confidence · {item.trigger}</p>
              </div>
              <strong className={item.outcome.startsWith("+") ? "text-profit" : "text-loss"}>{item.outcome}</strong>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
