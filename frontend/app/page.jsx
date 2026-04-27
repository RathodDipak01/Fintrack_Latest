"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, 
  BrainCircuit, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  PieChart, 
  Globe, 
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Gem
} from "lucide-react";
import { GlassCard, Pill } from "@/components/ui";

function LivingDashboard() {
  const [numbers, setNumbers] = useState({
    netWorth: 1245678,
    returns: 123456,
    gain: 5678
  });
  const [aiStrategy, setAiStrategy] = useState("Analyzing market trends and latest news...");

  useEffect(() => {
    const interval = setInterval(() => {
      setNumbers(prev => ({
        netWorth: prev.netWorth + (Math.random() * 10 - 5),
        returns: prev.returns + (Math.random() * 5 - 2),
        gain: prev.gain + (Math.random() * 2 - 1)
      }));
    }, 2000);

    // Fetch dynamic AI strategy
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/ai/market-strategy`)

      .then(res => res.json())
      .then(data => {
        if (data?.data?.strategy) {
          setAiStrategy(data.data.strategy.replace("STRATEGY: ", ""));
        }
      })
      .catch(err => console.error("Strategy fetch error:", err));

    return () => clearInterval(interval);
  }, []);

  const format = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0b0f19] p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden group">
      {/* Top Navigation Mock */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="h-8 w-8 rounded bg-ai flex items-center justify-center font-bold text-white text-xs">F</div>
          <div className="hidden md:flex gap-4">
            {['Dashboard', 'Portfolio', 'AI Insights', 'Stocks'].map((t, i) => (
              <div key={t} className={`text-[10px] font-bold uppercase tracking-widest ${i === 0 ? "text-ai" : "text-slate-500"}`}>{t}</div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 rounded bg-white/5 border border-white/10" />
          <div className="h-6 w-6 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Net Worth", val: format(numbers.netWorth), tone: "ai" },
          { label: "Total Returns", val: format(numbers.returns), tone: "profit" },
          { label: "Today's Gain", val: format(numbers.gain), tone: "profit" },
          { label: "Risk Score", val: "42/100", tone: "warn" }
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold text-white tabular-nums`}>{stat.val}</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ x: ["-100%", "100%"] }} 
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className={`h-full w-1/2 bg-${stat.tone}`} 
               />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Portfolio Performance</h4>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '1Y'].map(t => <div key={t} className="text-[8px] p-1 rounded bg-white/5 text-slate-500">{t}</div>)}
            </div>
          </div>
          <div className="h-48 flex items-end gap-1">
             {[...Array(30)].map((_, i) => (
               <motion.div 
                 key={i}
                 initial={{ height: "20%" }}
                 animate={{ height: `${20 + Math.random() * 60}%` }}
                 transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                 className="flex-1 bg-gradient-to-t from-ai/10 to-ai/40 rounded-t-sm"
               />
             ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Asset Allocation</h4>
          <div className="relative h-32 w-32 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-[12px] border-white/5" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[12px] border-t-ai border-r-profit border-b-warn border-l-purple-500" 
            />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-[8px] text-slate-500 uppercase font-bold">Total</span>
               <span className="text-xs text-white font-bold">₹12.4L</span>
            </div>
          </div>
          <div className="space-y-2">
             {['Equity', 'Debt', 'Gold'].map((t, i) => (
               <div key={t} className="flex justify-between text-[10px]">
                 <span className="text-slate-500">{t}</span>
                 <span className="text-white font-bold">{[65, 20, 10][i]}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom Alert Dynamic */}
      <motion.div 
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mt-6 p-3 rounded-xl bg-ai/5 border border-ai/20 flex items-center gap-3"
      >
        <Sparkles size={14} className="text-ai shrink-0" />
        <p className="text-[10px] font-medium text-slate-300">
          <span className="text-ai font-bold">AI STRATEGY:</span> {aiStrategy}
        </p>
      </motion.div>

      {/* Glossy overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30" />
    </div>
  );
}

export default function LandingPage() {
  const features = [
    {
      title: "Gemini AI Advisor",
      desc: "Institutional-grade portfolio audits and strategic advice powered by advanced Google Gemini models.",
      icon: <BrainCircuit className="text-ai" size={24} />,
      color: "bg-ai/10"
    },
    {
      title: "Real-time Broker Sync",
      desc: "Connect seamlessly with Zerodha, Angel One, Upstox, and Groww for instant portfolio updates.",
      icon: <Zap className="text-profit" size={24} />,
      color: "bg-profit/10"
    },
    {
      title: "Advanced Analytics",
      desc: "Deep-dive into sector allocation, market cap distribution, and risk-adjusted return metrics.",
      icon: <BarChart3 className="text-warn" size={24} />,
      color: "bg-warn/10"
    }
  ];

  const plans = [
    {
      name: "Lite",
      price: "0",
      trial: "7 Days Free",
      features: ["Basic Portfolio Tracking", "2 Broker Connections", "Daily AI Summary", "Standard Analytics"],
      cta: "Start 7-Day Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: "199",
      features: ["Unlimited Broker Sync", "Real-time Market Data", "Deep-dive AI Insights", "Advanced Technical Charts"],
      cta: "Get Started Pro",
      popular: true
    },
    {
      name: "Elite",
      price: "499",
      features: ["Personal AI Strategist", "Tax Harvesting Signals", "Priority Sync Engine", "Early Beta Access"],
      cta: "Join Elite Club",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#03050a] text-slate-300 selection:bg-ai/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#03050a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-ai to-blue-400 flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Fintrack</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="text-sm font-medium hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-white hover:text-ai transition-colors">Sign In</Link>
            <Link href="/signup" className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ink shadow-xl hover:bg-slate-200 transition-all">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-ai/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* <Pill tone="ai" className="mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={12} className="mr-2 inline" />
              Powered by Google Gemini 1.5 Pro
            </Pill>  */}
            <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
              Wealth tracking <br />
              <span className="bg-gradient-to-r from-ai via-blue-400 to-purple-400 bg-clip-text text-transparent">reimagined with AI</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400 md:text-xl">
              Fintrack combines real-time broker synchronization with institutional-grade AI insights to give you an unfair advantage in the markets.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="group flex items-center gap-2 rounded-full bg-ai px-8 py-4 text-lg font-bold text-white shadow-glow transition-all active:scale-95">

                Build your Portfolio
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10">
                View Live Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 flex justify-center"
          >
            <LivingDashboard />
          </motion.div>
        </div>
      </section>

      {/* Why Fintrack Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <Pill tone="ai" className="px-4 py-1">The Problem We Solve</Pill>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Most investors are flying blind. <br />
                <span className="text-slate-500 italic">We provide the radar.</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Traditional apps show you numbers. Fintrack shows you the truth. We unify your fragmented financial life into a single, high-fidelity command center.
              </p>
              
              <div className="space-y-6 pt-4">
                {[
                  { title: "No more tab-switching", desc: "See your Zerodha, Angel, and Upstox holdings in one unified, real-time balance sheet.", icon: <Globe size={20} className="text-ai" /> },
                  { title: "Objective AI Audits", desc: "Remove emotional bias. Our AI scans for overexposure and risk patterns that humans often miss.", icon: <ShieldCheck size={20} className="text-profit" /> },
                  { title: "Tax-Smart Growth", desc: "Elite users get real-time tax-loss harvesting signals to save lakhs in capital gains tax.", icon: <Zap size={20} className="text-warn" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1 h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-ai/50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-ai/10 blur-3xl rounded-full" />
              <GlassCard className="p-2 border-white/10 relative z-10">
                <div className="rounded-2xl overflow-hidden bg-ink/50 p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-24 bg-white/10 rounded" />
                    <div className="h-2 w-12 bg-ai/40 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-ai/10 rounded-xl border border-ai/20 animate-pulse" />
                    <div className="h-20 bg-profit/10 rounded-xl border border-profit/20" />
                    <div className="h-20 bg-white/5 rounded-xl border border-white/10" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-white/5 rounded" />
                    <div className="h-2 w-[80%] bg-white/5 rounded" />
                    <div className="h-2 w-[90%] bg-white/5 rounded" />
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-ai/20" />
                    <div className="h-3 w-32 bg-ai/40 rounded" />
                  </div>
                </div>
              </GlassCard>
              
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass px-4 py-3 rounded-2xl border border-ai/30 shadow-glow z-20"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-profit" />
                  <span className="text-xs font-bold text-white">+₹24,500 Tax Saved</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 text-center md:grid-cols-4">
            {[
              { val: "₹150Cr+", label: "Assets Tracked" },
              { val: "25k+", label: "Active Investors" },
              { val: "4.9/5", label: "App Rating" },
              { val: "99.9%", label: "Uptime Sync" }
            ].map(s => (
              <div key={s.label}>
                <h3 className="text-4xl font-bold text-white">{s.val}</h3>
                <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold text-white md:text-5xl">Everything you need to grow</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">Our suite of institutional-grade tools is now available for every retail investor.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <GlassCard key={i} className="p-10 transition-all hover:-translate-y-2">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{f.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-400">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <Pill tone="profit" className="mb-4">Flexible Pricing</Pill>
            <h2 className="text-3xl font-bold text-white md:text-5xl">Invest in your financial future</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((p, i) => (
              <div key={i} className={`relative flex flex-col rounded-3xl border p-10 transition-all ${p.popular ? "border-ai bg-ai/5 shadow-glow" : "border-white/10 bg-white/[0.02]"}`}>

                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-ai px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Most Professional Choice
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    {p.price === "0" && <span className="text-xl text-slate-500 line-through">₹99</span>}
                    <span className="text-4xl font-bold text-white">{p.price === "0" ? "FREE" : `₹${p.price}`}</span>
                    {p.price !== "0" && <span className="text-slate-500">/month</span>}
                    {p.trial && <span className="ml-1 text-xs font-bold text-profit uppercase tracking-widest bg-profit/10 px-2 py-0.5 rounded-full">{p.trial}</span>}
                  </div>
                  {p.price === "0" && <p className="mt-2 text-xs text-slate-500 italic">then ₹99/month after trial</p>}
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-ai" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`rounded-xl py-4 text-center text-sm font-bold uppercase tracking-widest transition-all ${p.popular ? "bg-ai text-white shadow-glow hover:bg-blue-500" : "bg-white text-ink hover:bg-slate-200 shadow-xl"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-ai/20 via-transparent to-transparent p-12 md:p-24 border border-white/10 overflow-hidden relative">
            <div className="grid gap-16 md:grid-cols-2 items-center relative z-10">
              <div>
                <Lock size={48} className="text-ai mb-8" />
                <h2 className="text-3xl font-bold text-white md:text-5xl">Your data is yours. <br /> Always.</h2>
                <p className="mt-6 text-lg text-slate-400">
                  We use AES-256 bank-level encryption to secure your holdings. Your broker credentials are never stored on our servers; we use secure OAuth tokens strictly for read-only access.
                </p>
                <div className="mt-10 flex gap-8">
                  <div className="text-center">
                    <ShieldCheck size={32} className="mx-auto text-profit mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">GDPR Compliant</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheck size={32} className="mx-auto text-profit mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">ISO Certified</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheck size={32} className="mx-auto text-profit mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">256-bit SSL</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                 <div className="aspect-square rounded-full border-[40px] border-ai/5 absolute inset-0 animate-pulse" />
                 <Globe size={300} className="mx-auto text-ai/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-ai to-blue-400 flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Fintrack</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Disclaimer: Investing in stock markets involves risk. Past performance is not indicative of future results. AI insights are for informational purposes only.
          </p>
          <div className="mt-12 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-600">
            <Link href="/legal/privacy" className="hover:text-ai transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-ai transition-colors">Terms of Service</Link>
            <Link href="/legal/risk" className="hover:text-ai transition-colors">Risk Disclosure</Link>
          </div>
          <p className="mt-12 text-xs text-slate-700">© 2026 Fintrack AI Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
