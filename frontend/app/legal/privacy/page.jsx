"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Lock, Eye, Server } from "lucide-react";
import { GlassCard } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#03050a] text-slate-300 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-ai hover:text-blue-400 mb-12 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Privacy Policy</h1>
            <p className="text-slate-400">Last Updated: April 25, 2026</p>
          </div>

          <GlassCard className="p-8 md:p-12 space-y-8 border-white/10 bg-white/[0.02]">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-ai mb-4">
                <Shield size={24} />
                <h2 className="text-2xl font-bold text-white">Our Commitment</h2>
              </div>
              <p className="leading-relaxed">
                At Fintrack, we believe your financial data is sacred. Our business model is built on subscriptions, not on selling your personal information. We use bank-level encryption to ensure that your holdings and strategy remain private and secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">1. Data We Collect</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Lock className="text-ai mb-2" size={20} />
                  <h4 className="text-white font-semibold text-sm">Account Info</h4>
                  <p className="text-xs text-slate-500 mt-1">Name, email, and contact number used for identity verification and communication.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Server className="text-ai mb-2" size={20} />
                  <h4 className="text-white font-semibold text-sm">Broker Tokens</h4>
                  <p className="text-xs text-slate-500 mt-1">Temporary OAuth tokens used strictly for read-only access to your portfolio holdings.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-400 ml-2">
                <li>To synchronize your portfolio holdings from connected brokers.</li>
                <li>To provide personalized AI-driven investment insights and risk audits.</li>
                <li>To send critical market alerts and subscription-related updates.</li>
                <li>To improve our predictive models without ever exposing individual identities.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">3. Information Sharing</h2>
              <p className="leading-relaxed">
                Fintrack does not sell, rent, or trade your personal data with third parties. We only share data with service providers (like Google Gemini for AI analysis) under strict confidentiality agreements, where data is anonymized wherever possible.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 text-profit font-bold uppercase tracking-widest text-xs">
                <Eye size={14} />
                Your Rights
              </div>
              <p className="text-sm text-slate-500">
                You have the right to export your data, request deletion of your account, or disconnect your brokers at any time. All data associated with your account is permanently purged within 30 days of an account deletion request.
              </p>
            </section>
          </GlassCard>

          <div className="text-center text-slate-500 text-xs">
            Questions about our privacy practices? Reach out to <span className="text-ai">privacy@fintrack.app</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
