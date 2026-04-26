"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useSettings } from "@/context/settings-context";

export function GlassCard({ children, className = "", delay = 0 }) {
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
  tone = "profit",
  showPrivacyToggle = false,
  isPrivate = false,
  onTogglePrivacy,
  isCurrency = true,
}) {
  const { formatCurrency, t } = useSettings();

  const colors = {
    profit: "text-profit",
    loss: "text-loss",
    ai: "text-ai",
    warn: "text-warn",
  };
  const Icon = tone === "loss" ? ArrowDownRight : ArrowUpRight;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{t(label.toLowerCase().replace(/ /g, "_"))}</p>
        {showPrivacyToggle && (
          <button
            onClick={onTogglePrivacy}
            className="text-slate-500 hover:text-ai transition"
          >
            {isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-col items-start gap-1">
        <strong className="text-2xl font-semibold tracking-normal text-white">
          {isPrivate ? "••••••••" : (isCurrency ? formatCurrency(value) : value)}
        </strong>
        <span
          className={`flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs ${colors[tone]}`}
        >
          <Icon size={15} />
          {change}
        </span>
      </div>
    </GlassCard>
  );
}

export function Pill({ children, tone = "ai" }) {
  const toneClass = {
    profit: "border-profit/30 bg-profit/10 text-profit",
    loss: "border-loss/30 bg-loss/10 text-loss",
    ai: "border-ai/30 bg-ai/10 text-ai",
    warn: "border-warn/30 bg-warn/10 text-warn",
    neutral: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  };

  return (
    <span
      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal text-white md:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f19] shadow-2xl shadow-ai/10"
      >
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto thin-scrollbar p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
