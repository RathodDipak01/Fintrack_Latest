"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LineChart, LogIn, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { alerts } from "@/lib/portfolio-data";
import { GlassCard, Pill } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { MarketTicker } from "@/components/market-ticker";
import { StockSearchBar } from "@/components/stock-search-bar";
import { fintrackApi, setAuthToken } from "@/lib/api";

import { useSettings } from "@/context/settings-context";

const nav = [
  { label: "dashboard", href: "/dashboard" },
  { label: "portfolio", href: "/portfolio" },
  { label: "import_data", href: "/import" },
  { label: "ai_insights", href: "/ai-insights" },
  { label: "stocks", href: "/stocks" },
  { label: "alerts", href: "/alerts" },
  { label: "watchlist", href: "/watchlist" },
  { label: "suggestions", href: "/suggestions" },
];


function NotificationDrawer({ open, onClose }) {
  const { t } = useSettings();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <motion.aside
        initial={{ x: 360 }}
        animate={{ x: 0 }}
        className="glass ml-auto h-full w-full max-w-sm rounded-none p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{t("notifications") || "Notifications"}</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"
          >
            {t("close") || "Close"}
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
            >
              <Pill tone={alert.tone}>{alert.type}</Pill>
              <p className="mt-3 font-semibold text-white">{alert.title}</p>
              <p className="mt-1 text-sm text-slate-400">
                {alert.status} alert
              </p>
            </div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
}

function TopNav({ onNotifications }) {
  const pathname = usePathname();
  const { t, settings } = useSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/78 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-4 md:px-8 py-4 sm:gap-4">
        <button
          className="rounded-md border border-white/10 p-2 text-slate-300 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ai text-white shadow-glow">
            <LineChart size={22} />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Fintrack</p>
            <p className="text-xs text-slate-400">
              {t("ai_portfolio_center") || "AI portfolio command center"}
            </p>
          </div>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 overflow-x-auto xl:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white ${active ? "bg-white/10 text-white" : "text-slate-400"}`}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden min-w-72 items-center md:flex z-50">
          <StockSearchBar />
        </div>
        <button
          onClick={onNotifications}
          className="rounded-md border border-white/10 p-2 text-slate-300 transition hover:border-ai/40 hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
        <div className="hidden md:block">
          <ThemeToggle compact />
        </div>
        <Link
          href="/login"
          className="hidden rounded-md border border-ai/30 bg-ai/10 px-3 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white sm:flex"
        >
          <LogIn size={16} className="mr-2" />
          {t("login") || "Login"}
        </Link>
        <Link href="/profile" className="transition hover:opacity-80">
          <Image
            src={settings.user.avatar}
            alt={settings.user.name}
            width={40}
            height={40}
            loading="eager"
            className="rounded-lg border border-white/10 shadow-glow"
          />
        </Link>
      </div>
    </header>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { t } = useSettings();

  return (
    <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
      <div className="sticky top-20 space-y-4 p-0">
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {t("app_sections") || "App sections"}
          </p>
          <div className="mt-4 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white ${pathname === item.href ? "bg-ai/15 text-ai" : "text-slate-400"}`}
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {t("next_best_action") || "Next best action"}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {t("trim_it_exposure") || "Trim IT exposure by 6%"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {t("risk_contribution_msg") || "Risk contribution is rising faster than return contribution this week."}
          </p>
          <button className="mt-5 w-full rounded-md bg-ai px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500">
            {t("run_rebalance") || "Run rebalance"}
          </button>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{t("theme")}</span>
            <ThemeToggle compact />
          </div>
        </GlassCard>
      </div>
    </aside>
  );
}

export function AppShell({ children, withSidebar = true }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <TopNav
        onNotifications={() => setNotificationsOpen(true)}
      />
      <MarketTicker />
      <main className="flex w-full gap-0 px-4 md:px-8 py-0 lg:gap-5 mt-4">
        {withSidebar && <Sidebar />}
        <div className="min-w-0 flex-1 space-y-4 p-0 sm:space-y-5">
          {children}
        </div>
      </main>
      <NotificationDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
