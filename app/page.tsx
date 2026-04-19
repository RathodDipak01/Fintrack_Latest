"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  BrainCircuit,
  ChevronDown,
  Gauge,
  LineChart,
  LogIn,
  Menu,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { AllocationChart, CandleProxyChart, ForecastChart, MobilePriceChart, PerformanceChart, Sparkline } from "@/components/charts";
import { GlassCard, Pill, SectionHeader, StatCard } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { WatchlistPanel } from "@/components/watchlist-panel";
import { MarketTicker } from "@/components/market-ticker";
import {
  alerts,
  allocationData,
  analystRatings,
  companyInsights,
  holdings,
  keyEvents,
  sentimentDetails,
  shareholdingPatterns,
  stockSignals,
  suggestionHistory
} from "@/lib/portfolio-data";

const tabs = ["7D", "1M", "3M", "1Y"];
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

function Navbar({ onAuth, onNotifications }: { onAuth: () => void; onNotifications: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/78 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-0 py-4 sm:gap-4">
        <button className="rounded-md border border-white/10 p-2 text-slate-300 lg:hidden" aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ai text-white shadow-glow">
            <LineChart size={22} />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Fintrack</p>
            <p className="text-xs text-slate-400">AI portfolio command center</p>
          </div>
        </div>
        <nav className="ml-4 hidden items-center gap-1 overflow-x-auto xl:flex">
          {nav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white ${index === 0 ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400 md:flex">
          <Search size={18} />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Search TCS, NIFTY, mutual funds" />
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
  return (
    <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
      <div className="sticky top-20 space-y-3 p-0">
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

function Hero() {
  return (
    <section id="dashboard" className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 bg-ai/10 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_260px] md:items-end">
          <div>
            <Pill tone="ai">AI risk engine active</Pill>
            <p className="mt-6 text-sm text-slate-400">Net worth</p>
            <h1 className="mt-2 text-4xl font-bold tracking-normal text-white md:text-6xl">₹48,72,940</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-profit/10 px-3 py-2 text-sm font-semibold text-profit">+₹1,24,800 today</span>
              <span className="rounded-md bg-white/5 px-3 py-2 text-sm text-slate-300">+2.63% vs +0.84% NIFTY50</span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Your portfolio is beating the benchmark, but the excess return is concentrated in IT and large-cap momentum.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <Sparkline />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">5-day momentum</span>
              <span className="font-semibold text-profit">Strong</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">AI Insights</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Moderately risky</h2>
          </div>
          <BrainCircuit className="text-ai" size={30} />
        </div>
        <div className="mt-6 space-y-4">
          {["Expected growth next week: +3.2%", "Overexposed to IT sector", "Downside risk reduced by banking allocation"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + index * 0.08 }}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
            >
              <Sparkles size={18} className={index === 1 ? "text-warn" : "text-ai"} />
              <span className="text-sm text-slate-200">{item}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

function Stats() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total investment" value="₹39.22L" change="+12.6%" />
      <StatCard label="Current value" value="₹48.72L" change="+24.2%" tone="profit" />
      <StatCard label="Total returns" value="₹9.50L" change="+₹84K MoM" tone="ai" />
      <StatCard label="Risk score" value="62/100" change="Medium" tone="warn" />
    </section>
  );
}

function Performance() {
  return (
    <GlassCard className="p-6">
      <SectionHeader
        eyebrow="Performance"
        title="Portfolio vs NIFTY50"
        action={
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
            {tabs.map((tab, index) => (
              <button key={tab} className={`rounded-md px-3 py-2 text-sm ${index === 1 ? "bg-ai text-white" : "text-slate-400"}`}>
                {tab}
              </button>
            ))}
          </div>
        }
      />
      <PerformanceChart />
    </GlassCard>
  );
}

function Portfolio() {
  return (
    <section id="portfolio" className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
      <GlassCard className="overflow-hidden p-6">
        <SectionHeader
          eyebrow="Portfolio"
          title="Holdings intelligence"
          action={
            <div className="flex gap-2">
              <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">Sector <ChevronDown size={14} className="inline" /></button>
              <button className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">P&L <ChevronDown size={14} className="inline" /></button>
            </div>
          }
        />
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Avg cost</th>
                <th className="px-3 py-2">Current</th>
                <th className="px-3 py-2">% Change</th>
                <th className="px-3 py-2">Total P&L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((stock) => (
                <tr key={stock.symbol} className="rounded-lg bg-white/[0.035] text-sm text-slate-300 transition hover:bg-white/[0.07]">
                  <td className="rounded-l-lg px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-panel2 font-semibold text-white">{stock.symbol.slice(0, 2)}</div>
                      <div>
                        <p className="font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-slate-500">{stock.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">{stock.qty}</td>
                  <td className="px-3 py-4">₹{stock.avg}</td>
                  <td className="px-3 py-4">₹{stock.price}</td>
                  <td className={`px-3 py-4 font-semibold ${stock.change >= 0 ? "text-profit" : "text-loss"}`}>{stock.change}%</td>
                  <td className={`rounded-r-lg px-3 py-4 font-semibold ${stock.pnl.startsWith("-") ? "text-loss" : "text-profit"}`}>₹{stock.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Allocation" title="Sector concentration" />
        <AllocationChart />
        <div className="space-y-3">
          {allocationData.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-slate-500">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-warn/20 bg-warn/10 p-3 text-sm text-warn">Diversification: concentrated in IT, otherwise balanced.</div>
        </div>
      </GlassCard>
    </section>
  );
}

function AiInsights() {
  return (
    <section id="ai-insights" className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <GlassCard className="p-6">
        <SectionHeader eyebrow="AI Risk" title="Volatility + diversification score" />
        <div className="relative mx-auto grid h-56 w-56 place-items-center rounded-full border-[18px] border-ai/20 bg-white/[0.035]">
          <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-r-warn border-t-profit" />
          <div className="text-center">
            <p className="text-5xl font-bold text-white">62</p>
            <p className="mt-1 text-sm text-slate-400">Medium risk</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Forecast" title="Prophet-style growth projection" />
        <ForecastChart />
      </GlassCard>

      <GlassCard className="p-6 xl:col-span-2">
        <SectionHeader eyebrow="Signals" title="What the model thinks matters now" />
        <div className="grid gap-4 md:grid-cols-3">
          {stockSignals.map((signal) => (
            <div key={signal.symbol} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-ai/30 hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <strong className="text-white">{signal.symbol}</strong>
                <Pill tone={signal.signal === "Bullish" ? "profit" : "loss"}>{signal.signal}</Pill>
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
    </section>
  );
}

function StockDetail() {
  return (
    <section id="stocks" className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Stock Detail"
          title="TCS real-time view"
          action={<Pill tone="profit">+2.4%</Pill>}
        />
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <h3 className="text-4xl font-bold text-white">₹3,684.20</h3>
          <span className="pb-2 text-sm text-profit">+₹86.40 today</span>
        </div>
        <div className="mb-4 flex gap-2">
          {["1D", "1W", "1M", "1Y"].map((range, index) => (
            <button key={range} className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-white/10 text-white" : "border border-white/10 text-slate-400"}`}>
              {range}
            </button>
          ))}
        </div>
        <CandleProxyChart />
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Prediction" title="Next movement" />
        <div className="rounded-lg border border-profit/20 bg-profit/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Direction</span>
            <Pill tone="profit">UP</Pill>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">81%</p>
          <p className="mt-2 text-sm text-slate-400">Confidence score</p>
        </div>
        <div className="mt-5 space-y-4">
          <Insight icon={<Zap size={18} />} title="Trend summary" text="Price is above short-term moving averages with clean demand follow-through." />
          <Insight icon={<Gauge size={18} />} title="Volume indication" text="Volume is 1.4x the 10-day average, suggesting institutional participation." />
          <Insight icon={<ShieldAlert size={18} />} title="Plain-language risk" text="Upside remains likely, but position sizing should stay moderate after a fast run." />
        </div>
      </GlassCard>
    </section>
  );
}

function Insight({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <span className="mt-1 text-ai">{icon}</span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function Alerts() {
  return (
    <section id="alerts">
      <GlassCard className="p-6">
        <SectionHeader eyebrow="Alerts" title="Risk, price and opportunity notifications" />
        <div className="grid gap-4 md:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <Pill tone={alert.tone as "profit" | "loss" | "warn"}>{alert.type}</Pill>
                <Pill tone={alert.status === "Active" ? "ai" : "neutral"}>{alert.status}</Pill>
              </div>
              <p className="mt-5 text-base font-semibold text-white">{alert.title}</p>
              <button className="mt-5 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-ai/40 hover:text-white">
                View action
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
      <div className="fixed bottom-5 right-5 hidden rounded-lg border border-profit/30 bg-profit/10 px-4 py-3 text-sm text-profit shadow-glow backdrop-blur md:block">
        Forecast refreshed. AI confidence improved to 81%.
      </div>
    </section>
  );
}

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

function GeminiAdvisor() {
  const [insights, setInsights] = useState<string[]>(["Analyzing portfolio with Gemini-ready workflow..."]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    fetch("/api/ai-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedStock: "ADANIPOWER", holdings, riskScore: 62, alerts })
    })
      .then((response) => response.json())
      .then((data) => {
        setInsights(data.insights ?? insights);
        setSource(data.source ?? "mock");
      })
      .catch(() => {
        setInsights(["Gemini mock mode is active. Add the API key on the server to switch to live insight generation."]);
      });
  }, []);

  return (
    <GlassCard className="p-6">
      <SectionHeader eyebrow="Gemini AI" title="Decision assistant" action={<Pill tone={source === "gemini" ? "profit" : "warn"}>{source === "gemini" ? "Live" : "Mock"}</Pill>} />
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
  );
}

function StockMobileExperience() {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]" id="adani-power">
      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-profit">INDmoney-style stock page</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Adani Power Ltd</h2>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-white/10 p-2 text-slate-300"><Plus size={18} /></button>
              <button className="rounded-md border border-white/10 p-2 text-slate-300"><Search size={18} /></button>
            </div>
          </div>
          <div className="mt-5">
            <MobilePriceChart />
          </div>
          <div className="thin-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"].map((range, index) => (
              <button key={range} className={`shrink-0 rounded-md px-4 py-2 text-sm ${index === 0 ? "bg-white text-midnight" : "border border-white/10 text-slate-300"}`}>{range}</button>
            ))}
            <button className="shrink-0 rounded-md border border-profit/30 px-4 py-2 text-sm text-profit">Chart</button>
          </div>
        </div>
        <div className="flex border-b border-white/10 px-5">
          {["Overview", "Live", "F&O", "Notes"].map((tab, index) => (
            <button key={tab} className={`relative px-4 py-4 text-sm ${index === 0 ? "text-white" : "text-slate-400"}`}>
              {tab}
              {index === 0 && <span className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-profit" />}
            </button>
          ))}
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold text-white">Insights on Adani Power Ltd</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">Insights help you understand recent movement of the company's critical parameters.</p>
          <div className="thin-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
            {companyInsights.map((item) => (
              <div key={item.title} className="min-w-[260px] rounded-lg border border-profit/40 bg-profit/10 p-4">
                <Pill tone={item.tag === "Watch closely" ? "warn" : "profit"}>{item.tag}</Pill>
                <h4 className="mt-5 text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="space-y-5">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Analyst rating" title="Based on 7 analysts" action={<Pill tone="profit">POSITIVE</Pill>} />
          <div className="grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-profit text-2xl font-bold tracking-[0.16em] text-white">POSITIVE</div>
            <div className="space-y-4">
              {analystRatings.map((rating) => (
                <div key={rating.label} className="grid grid-cols-[1fr_56px_54px] items-center gap-3 text-sm">
                  <div className="h-3 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${rating.value}%`, background: rating.color }} /></div>
                  <span className="text-slate-300">{rating.value}%</span>
                  <span className="text-slate-400">{rating.label}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Shareholding" title="Shareholding patterns" />
          <div className="mb-4 flex flex-wrap gap-2">
            {["2026", "2025", "2024", "2023", "2022", "2021"].map((year, index) => (
              <button key={year} className={`rounded-md px-3 py-2 text-sm ${index === 0 ? "bg-ai/15 text-ai" : "bg-white/5 text-slate-400"}`}>{year}</button>
            ))}
          </div>
          <div className="rounded-lg border border-white/10">
            {shareholdingPatterns.map((row) => (
              <div key={row.investor} className="flex justify-between border-b border-white/10 px-4 py-4 last:border-b-0">
                <span className="text-slate-300">{row.investor}</span>
                <strong className="text-white">{row.holdings}</strong>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 xl:col-span-2">
        <SectionHeader eyebrow="Live" title="Key events for Adani Power Ltd" />
        <div className="thin-scrollbar flex gap-4 overflow-x-auto pb-2">
          {keyEvents.map((event) => (
            <div key={event.title} className="min-w-[320px] rounded-lg border border-profit/20 bg-profit/10 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-profit text-white"><LineChart size={18} /></div>
              <h3 className="mt-5 text-lg font-semibold leading-7 text-white">{event.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{event.text}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 xl:col-span-2">
        <SectionHeader eyebrow="Company" title="Company information and sentiment" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm leading-7 text-slate-300">
              Adani Power, a key player in India's power sector, was incorporated in 1996 and founded by Gautam Adani. The company is headquartered in Ahmedabad, Gujarat.
            </p>
            <div className="mt-5 divide-y divide-white/10 rounded-lg border border-white/10">
              {[
                ["Organization", "Adani Power Ltd"],
                ["HeadQuarters", "-"],
                ["Industry", "Power Generation & Distribution"]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-4 text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-right font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-semibold text-white">Market sentiment</h3>
            <div className="mt-4 space-y-3">
              {sentimentDetails.map((item) => (
                <div key={item.label} className="flex justify-between border-b border-white/10 pb-3 last:border-b-0">
                  <span className="text-slate-300">{item.label}</span>
                  <strong className="text-white">{item.value}</strong>
                </div>
              ))}
            </div>
            <button className="mt-5 w-full rounded-md border border-ai/30 px-4 py-3 text-ai">Hide Details</button>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

function WatchlistAndSuggestions() {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <WatchlistPanel defaultLayout="list" eyebrow="Watchlist" title="Track before deciding" />

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Suggestions" title="Suggestion history" />
        <div className="space-y-3">
          {suggestionHistory.map((item) => (
            <div key={`${item.symbol}-${item.date}`} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
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
    </section>
  );
}

function SkeletonStrip() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-20 animate-pulse rounded-lg border border-white/10 bg-white/[0.035]" />
      ))}
    </div>
  );
}

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <Navbar onAuth={() => setAuthOpen(true)} onNotifications={() => setNotificationsOpen(true)} />
      <MarketTicker />
      <main className="flex w-full gap-0 py-0 lg:gap-5 mt-4">
        <Sidebar />
        <div className="min-w-0 flex-1 space-y-4 p-0 sm:space-y-5">
          <Hero />
          <Stats />
          <GeminiAdvisor />
          <Performance />
          <Portfolio />
          <AiInsights />
          <StockDetail />
          <StockMobileExperience />
          <WatchlistAndSuggestions />
          <Alerts />
          <SkeletonStrip />
        </div>
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
