"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -3, scale: 1.005 }}
      className={`glass rounded-lg ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function StatCard({
  label,
  value,
  change,
  tone = "profit"
}: {
  label: string;
  value: string;
  change: string;
  tone?: "profit" | "loss" | "ai" | "warn";
}) {
  const colors = {
    profit: "text-profit",
    loss: "text-loss",
    ai: "text-ai",
    warn: "text-warn"
  };
  const Icon = tone === "loss" ? ArrowDownRight : ArrowUpRight;

  return (
    <GlassCard className="p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <strong className="text-2xl font-semibold tracking-normal text-white">{value}</strong>
        <span className={`flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-sm ${colors[tone]}`}>
          <Icon size={15} />
          {change}
        </span>
      </div>
    </GlassCard>
  );
}

export function Pill({ children, tone = "ai" }: { children: ReactNode; tone?: "profit" | "loss" | "ai" | "warn" | "neutral" }) {
  const toneClass = {
    profit: "border-profit/30 bg-profit/10 text-profit",
    loss: "border-loss/30 bg-loss/10 text-loss",
    ai: "border-ai/30 bg-ai/10 text-ai",
    warn: "border-warn/30 bg-warn/10 text-warn",
    neutral: "border-slate-500/30 bg-slate-500/10 text-slate-300"
  };

  return <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}>{children}</span>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal text-white md:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
