"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import { GlassCard } from "@/components/ui";

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Terms of Service</h1>
            <p className="text-slate-400">Last Updated: April 25, 2026</p>
          </div>

          <GlassCard className="p-8 md:p-12 space-y-8 border-white/10 bg-white/[0.02]">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-ai mb-4">
                <FileText size={24} />
                <h2 className="text-2xl font-bold text-white">1. Agreement to Terms</h2>
              </div>
              <p className="leading-relaxed">
                By accessing or using Fintrack, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Fintrack reserves the right to modify these terms at any time, with notice provided via email or app notification.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">2. Description of Service</h2>
              <p className="leading-relaxed">
                Fintrack provides an AI-powered financial portfolio tracking and analysis platform. We aggregate data from your connected broker accounts to provide insights, alerts, and strategic advice.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warn/5 border border-warn/20 text-warn text-xs italic">
                <AlertTriangle size={14} />
                Fintrack is a tracking tool, not a registered investment advisor (RIA).
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">3. User Responsibilities</h2>
              <ul className="space-y-3 ml-2">
                {[
                  "You must be at least 18 years old to use the service.",
                  "You are responsible for maintaining the security of your account and password.",
                  "You must provide accurate and complete information during registration.",
                  "You agree not to use the service for any illegal or unauthorized purposes."
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-400">
                    <CheckCircle2 size={16} className="text-ai shrink-0 mt-0.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">4. Subscription & Payments</h2>
              <p className="leading-relaxed">
                Subscriptions (Lite, Pro, Elite) are billed in advance on a monthly basis and are non-refundable. You may cancel your subscription at any time, which will take effect at the end of the current billing cycle.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
              <p className="leading-relaxed text-sm italic text-slate-500">
                Fintrack and its affiliates shall not be liable for any financial losses, damages, or missed opportunities resulting from the use of our platform or AI-generated insights. All investment decisions remain the sole responsibility of the user.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 text-ai font-bold uppercase tracking-widest text-xs">
                <Scale size={14} />
                Governing Law
              </div>
              <p className="text-sm text-slate-500">
                These terms are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai.
              </p>
            </section>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
