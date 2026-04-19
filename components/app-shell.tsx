"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LineChart, LogIn, Menu, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { alerts } from "@/lib/portfolio-data";
import { GlassCard, Pill } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { MarketTicker } from "@/components/market-ticker";

const nav = [
  { label: "Dashboard", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Import data", href: "/import" },
  { label: "AI Insights", href: "/ai-insights" },
  { label: "Stocks", href: "/stocks" },
  { label: "Alerts", href: "/alerts" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Suggestions", href: "/suggestions" }
];

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ai">Secure access</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Login to Fintrack</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">Close</button>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-400">Email</span>
            <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-ai" defaultValue="deepak@fintrack.app" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400">Password</span>
            <input className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-ai" type="password" defaultValue="mockpass" />
          </label>
          <button onClick={onClose} className="w-full rounded-md bg-ai px-4 py-3 text-sm font-semibold text-white shadow-glow">Login with mock account</button>
          <p className="text-center text-sm text-slate-500">Signup, logout and session state are mocked for the prototype.</p>
        </div>
      </motion.div>
    </div>
  );
}

function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <motion.aside initial={{ x: 360 }} animate={{ x: 0 }} className="glass ml-auto h-full w-full max-w-sm rounded-none p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <button onClick={onClose} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">Close</button>
        </div>
        <div className="mt-6 space-y-3">
          {alerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <Pill tone={alert.tone as "profit" | "loss" | "warn"}>{alert.type}</Pill>
              <p className="mt-3 font-semibold text-white">{alert.title}</p>
              <p className="mt-1 text-sm text-slate-400">{alert.status} alert</p>
            </div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
}

function TopNav({ onAuth, onNotifications }: { onAuth: () => void; onNotifications: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/78 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-0 py-4 sm:gap-4">
        <button className="rounded-md border border-white/10 p-2 text-slate-300 lg:hidden" aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ai text-white shadow-glow">
            <LineChart size={22} />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Fintrack</p>
            <p className="text-xs text-slate-400">AI portfolio command center</p>
          </div>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 overflow-x-auto xl:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`rounded-md px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white ${active ? "bg-white/10 text-white" : "text-slate-400"}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400 md:flex">
          <Search size={18} />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Search stocks, alerts, suggestions" />
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs">/</span>
        </div>
        <button onClick={onNotifications} className="rounded-md border border-white/10 p-2 text-slate-300 transition hover:border-ai/40 hover:text-white" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="hidden md:block">
          <ThemeToggle compact />
        </div>
        <button onClick={onAuth} className="hidden rounded-md border border-ai/30 bg-ai/10 px-3 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white sm:flex">
          <LogIn size={16} className="mr-2" />
          Login
        </button>
        <Image
          src="https://api.dicebear.com/8.x/initials/png?seed=Deepak&backgroundColor=1a2233,3b82f6&textColor=ffffff"
          alt="Profile avatar"
          width={40}
          height={40}
          className="rounded-lg border border-white/10"
        />
      </div>
    </header>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
      <div className="sticky top-20 space-y-4 p-0">
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">App sections</p>
          <div className="mt-4 space-y-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={`block rounded-md px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white ${pathname === item.href ? "bg-ai/15 text-ai" : "text-slate-400"}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Next best action</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Trim IT exposure by 6%</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Risk contribution is rising faster than return contribution this week.</p>
          <button className="mt-5 w-full rounded-md bg-ai px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500">
            Run rebalance
          </button>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Theme</span>
            <ThemeToggle compact />
          </div>
        </GlassCard>
      </div>
    </aside>
  );
}

export function AppShell({ children, withSidebar = true }: { children: ReactNode; withSidebar?: boolean }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <TopNav onAuth={() => setAuthOpen(true)} onNotifications={() => setNotificationsOpen(true)} />
      <MarketTicker />
      <main className="flex w-full gap-0 py-0 lg:gap-5 mt-4">
        {withSidebar && <Sidebar />}
        <div className="min-w-0 flex-1 space-y-4 p-0 sm:space-y-5">{children}</div>
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
