"use client";

import { motion } from "framer-motion";
import { Lock, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PLAN_LEVELS = {
  "free": 0,
  "lite": 1,
  "pro": 2,
  "elite": 3
};

const PLAN_NAMES = {
  lite: "Lite",
  pro: "Pro",
  elite: "Elite"
};

export function FeatureGuard({ 
  children, 
  minimumPlan = "lite", 
  featureName = "this feature",
  className = "" 
}) {
  const [userPlan, setUserPlan] = useState("free");
  const [userEmail, setUserEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = JSON.parse(localStorage.getItem("fintrack_user") || "{}");
    setUserPlan(user.plan?.toLowerCase() || "free");
    setUserEmail(user.email || "");
  }, []);

  if (!mounted) return <div className={className}>{children}</div>;

  const isSuperuser = userEmail === "deepak@fintrack.app";
  const hasAccess = isSuperuser || PLAN_LEVELS[userPlan] >= PLAN_LEVELS[minimumPlan];

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-md pointer-events-none select-none opacity-40">
        {children}
      </div>

      {/* Paywall Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0b0f19]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl max-w-xs"
        >
          <div className="h-12 w-12 rounded-xl bg-ai/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-ai" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Premium Feature</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Access to {featureName} is reserved for <span className="text-ai font-bold uppercase tracking-wider">{PLAN_NAMES[minimumPlan]}</span> members and above.
          </p>
          <Link 
            href="/profile" 
            className="w-full inline-flex items-center justify-center gap-2 bg-ai hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-glow"
          >
            <Zap size={14} className="fill-white" />
            Upgrade to {PLAN_NAMES[minimumPlan]}
          </Link>
        </motion.div>
      </div>
      
      {/* Subtle border to show it's a locked area */}
      <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-2xl pointer-events-none" />
    </div>
  );
}
