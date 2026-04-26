"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, TrendingDown, Zap, BarChart2 } from "lucide-react";
import { GlassCard } from "@/components/ui";

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-[#03050a] text-slate-300 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-warn hover:text-orange-400 mb-12 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Risk Disclosure</h1>
            <p className="text-slate-400 italic">Essential reading before you invest.</p>
          </div>

          <GlassCard className="p-8 md:p-12 space-y-8 border-warn/20 bg-warn/[0.02]">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-warn mb-4">
                <AlertCircle size={24} />
                <h2 className="text-2xl font-bold text-white">General Market Risk</h2>
              </div>
              <p className="leading-relaxed">
                Investing in the stock market involves significant risk of loss. Prices can fluctuate wildly based on economic, political, and company-specific factors. There is no guarantee that your investment will grow or that you will recover your initial capital.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">1. AI Insight Limitations</h2>
              <p className="leading-relaxed text-sm text-slate-400">
                The strategic advice provided by Fintrack's Gemini AI models is based on historical data and mathematical algorithms. Past performance is not indicative of future results. AI models can experience "hallucinations" or fail to account for black-swan events that defy historical patterns.
              </p>
              <div className="p-4 rounded-xl bg-ai/5 border border-ai/10 flex items-center gap-3 text-ai text-xs">
                <Zap size={16} />
                AI insights are for informational purposes only and do not constitute financial advice.
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-white">2. Specific Risks</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <TrendingDown size={24} className="text-loss mb-3" />
                  <h4 className="text-white font-bold text-sm">Capital Risk</h4>
                  <p className="text-xs text-slate-500 mt-2">You may lose some or all of your invested capital. Only invest money you can afford to lose.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <BarChart2 size={24} className="text-ai mb-3" />
                  <h4 className="text-white font-bold text-sm">Liquidity Risk</h4>
                  <p className="text-xs text-slate-500 mt-2">Some stocks or assets may be difficult to sell at your desired price during market volatility.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">3. Platform Dependency</h2>
              <p className="leading-relaxed text-sm text-slate-400">
                While we strive for 99.9% uptime, Fintrack is not responsible for losses resulting from platform downtime, delayed market data, or synchronization errors with your broker's API.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-warn/10">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-warn">Final Acknowledgment</h3>
              <p className="text-sm italic text-slate-500 leading-relaxed">
                By using Fintrack, you acknowledge that you are an independent investor and that all trades executed in your broker accounts—whether influenced by Fintrack insights or not—are done so at your own risk.
              </p>
            </section>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
