"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bell, 
  LineChart, 
  LogIn, 
  Menu, 
  Search, 
  LayoutDashboard, 
  Wallet, 
  FileUp, 
  Cpu, 
  TrendingUp, 
  Eye, 
  Lightbulb,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { alerts } from "@/lib/portfolio-data";
import { GlassCard, Pill } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { MarketTicker } from "@/components/market-ticker";
import { StockSearchBar } from "@/components/stock-search-bar";
import { fintrackApi, setAuthToken } from "@/lib/api";
import { useSettings } from "@/context/settings-context";

const nav = [
  { label: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "portfolio", href: "/portfolio", icon: Wallet },
  { label: "import_data", href: "/import", icon: FileUp },
  { label: "ml_strategy", href: "/ai-insights", icon: Cpu },
  { label: "stocks", href: "/stocks", icon: TrendingUp },
  { label: "alerts", href: "/alerts", icon: Bell },
  { label: "watchlist", href: "/watchlist", icon: Eye },
  { label: "suggestions", href: "/suggestions", icon: Lightbulb },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("fintrack_token") || !!localStorage.getItem("fintrack_user"));
    }
  }, []);

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
        <div className="ml-6 hidden items-center gap-2 lg:flex">
          <div className="h-4 w-px bg-white/10" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">
            Terminal {pathname.split('/')[1] || 'Dashboard'}
          </p>
        </div>
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
        {!isLoggedIn && (
          <Link
            href="/login"
            className="hidden rounded-md border border-ai/30 bg-ai/10 px-3 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white sm:flex"
          >
            <LogIn size={16} className="mr-2" />
            {t("login") || "Login"}
          </Link>
        )}
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
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  active 
                    ? "bg-ai/10 text-ai shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]" 
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-300 ${active ? "text-ai" : "text-slate-500 group-hover:text-slate-300"}`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <span className="capitalize">{t(item.label) || item.label.replace('_', ' ')}</span>
                </div>
                
                {active ? (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 h-6 w-1 rounded-r-full bg-ai shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  />
                ) : (
                  <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all" />
                )}
              </Link>
            );
          })}
        </div>



        {/* Settings Mini-Card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-profit animate-pulse" />
            </div>
            <span className="text-xs font-bold text-slate-400">System Live</span>
          </div>
          <ThemeToggle compact />
        </div>
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
