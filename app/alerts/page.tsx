"use client";

import { Bell, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { alerts } from "@/lib/portfolio-data";

export default function AlertsPage() {
  const activeCount = alerts.filter((a) => a.status === "Active").length;
  const riskCount = alerts.filter((a) => a.type === "Risk increase" || a.type === "Price drop" || a.tone === "loss").length;
  const opportunityCount = alerts.filter((a) => a.type === "Opportunity").length;

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-warn">Alerts</p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">Notifications and alert rules</h1>
        <p className="mt-4 max-w-3xl text-slate-400">Track price drops, risk increases and opportunity alerts across holdings and watchlist stocks.</p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <GlassCard className="p-6">
          <Bell className="text-ai" />
          <p className="mt-4 text-sm text-slate-400">Active alerts</p>
          <h2 className="mt-2 text-4xl font-bold text-white">{activeCount}</h2>
        </GlassCard>
        <GlassCard className="p-6">
          <ShieldAlert className="text-warn" />
          <p className="mt-4 text-sm text-slate-400">Risk alerts</p>
          <h2 className="mt-2 text-4xl font-bold text-white">{riskCount}</h2>
        </GlassCard>
        <GlassCard className="p-6">
          <Bell className="text-profit" />
          <p className="mt-4 text-sm text-slate-400">Opportunity alerts</p>
          <h2 className="mt-2 text-4xl font-bold text-white">{opportunityCount}</h2>
        </GlassCard>
      </section>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Rules" title="Alert center" action={<button className="rounded-md bg-ai px-3 py-2 text-sm font-semibold text-white">Create alert</button>} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <Pill tone={alert.tone as "profit" | "loss" | "warn" | "ai"}>{alert.type}</Pill>
                <Pill tone={alert.status === "Active" ? "ai" : "neutral"}>{alert.status}</Pill>
              </div>
              <p className="mt-5 text-base font-semibold text-white">{alert.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Push, in-app and dashboard notification enabled for this rule.</p>
              <button className="mt-5 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-ai/40 hover:text-white">
                Edit rule
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
