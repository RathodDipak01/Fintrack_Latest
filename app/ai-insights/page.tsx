"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, ShieldAlert, Sparkles } from "lucide-react";
import { ForecastChart } from "@/components/charts";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { alerts, holdings, stockSignals } from "@/lib/portfolio-data";

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<string[]>(["Loading Gemini-ready portfolio insights..."]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    fetch("/api/ai-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holdings, alerts, riskScore: 62 })
    })
      .then((response) => response.json())
      .then((data) => {
        setInsights(data.insights ?? insights);
        setSource(data.source ?? "mock");
      })
      .catch(() => setInsights(["Gemini mock mode is active. Server key can enable live model output."]));
  }, []);

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">AI Insights</p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">Risk, signals and forecast</h1>
        <p className="mt-4 max-w-3xl text-slate-400">Gemini-ready recommendations, concentration warnings and signal confidence for beginner and intermediate investors.</p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="AI Risk" title="Volatility + diversification score" action={<BrainCircuit className="text-ai" />} />
          <div className="relative mx-auto grid h-56 w-56 place-items-center rounded-full border-[18px] border-ai/20 bg-white/[0.035]">
            <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-r-warn border-t-profit" />
            <div className="text-center">
              <p className="text-5xl font-bold text-white">62</p>
              <p className="mt-1 text-sm text-slate-400">Medium risk</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Forecast" title="Prophet-style growth projection" />
          <ForecastChart />
        </GlassCard>
      </section>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Gemini" title="Decision assistant" action={<Pill tone={source === "gemini" ? "profit" : "warn"}>{source === "gemini" ? "Live" : "Mock"}</Pill>} />
        <div className="grid gap-3 md:grid-cols-3">
          {insights.map((insight, index) => (
            <div key={insight} className="rounded-lg border border-ai/20 bg-ai/10 p-4">
              <Sparkles className="text-ai" size={18} />
              <p className="mt-3 text-sm leading-6 text-slate-200">{insight}</p>
              <span className="mt-4 inline-block text-xs text-slate-500">Insight {index + 1}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Signals" title="Recommendation stance and confidence" />
        <div className="grid gap-4 md:grid-cols-3">
          {stockSignals.map((signal) => (
            <div key={signal.symbol} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between">
                <strong className="text-white">{signal.symbol}</strong>
                <Pill tone={signal.signal === "Bearish" ? "loss" : "profit"}>{signal.signal}</Pill>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-ai" style={{ width: `${signal.confidence}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{signal.confidence}% confidence</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{signal.note}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Warnings" title="What needs attention" action={<ShieldAlert className="text-warn" />} />
        <div className="grid gap-3 md:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <Pill tone={alert.tone as "profit" | "loss" | "warn"}>{alert.type}</Pill>
              <p className="mt-4 font-semibold text-white">{alert.title}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
