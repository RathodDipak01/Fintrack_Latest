"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2, Loader2, User, Lock, Eye, EyeOff, Chrome, Star, Zap, Gem } from "lucide-react";
import { GlassCard } from "@/components/ui";

import { fintrackApi, setAuthToken } from "@/lib/api";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: Dual OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtps = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await fintrackApi.sendOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fintrackApi.signup({ fullName, email, password, otp: emailOtp });
      if (response && response.token) {
        setAuthToken(response.token);
        localStorage.setItem("fintrack_user", JSON.stringify(response.user));
        setStep(3); // Go to membership selection
      }
    } catch (err) {
      setError(err.message || "Signup failed. Account may already exist.");
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    try {
      setIsLoading(true);
      const response = await fintrackApi.updateProfile({ plan });
      if (response && response.id) {
        localStorage.setItem("fintrack_user", JSON.stringify(response));
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Failed to set plan:", err);
      // Fallback: still redirect but log error
      window.location.href = "/dashboard";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#0b0f19] via-[#070a12] to-[#03050a] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-ai/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-profit/5 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-ai to-blue-400 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Fintrack</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white">{step === 1 ? "Create Account" : "Email Verification"}</h1>
          <p className="text-slate-400 mt-2">
            {step === 1 ? "Join the next generation of AI investing" : `We've sent a unique code to ${email}`}
          </p>
        </div>

        <GlassCard className="p-8 border-white/10 shadow-2xl overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-3 rounded-lg bg-loss/10 border border-loss/20 text-loss text-sm font-medium flex items-center gap-2"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-loss" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOtps}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-ai transition-all"
                      placeholder="Deepak Rathod"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-ai transition-all"
                      placeholder="deepak@fintrack.app"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white text-sm focus:outline-none focus:border-ai transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-ai hover:bg-ai/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-glow transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </motion.form>
            ) : step === 2 ? (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyAndSignup}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Mail size={12} className="text-ai" /> Email OTP
                      </label>
                      <span className="text-[10px] text-slate-600">{email}</span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/5 border border-ai/20 rounded-xl py-6 text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-ai transition-all"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading || emailOtp.length < 6}
                    className="w-full bg-profit hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    Verify & Continue
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-full text-xs text-slate-500 hover:text-ai transition-colors"
                  >
                    Back to edit details
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white">Select Your Plan</h2>
                  <p className="text-xs text-slate-400 mt-1">Start your 7-day free trial on Lite</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: "lite", name: "Lite", price: "FREE Trial", icon: <Star size={18} className="text-slate-400" />, desc: "2 Broker connections + AI summary" },
                    { id: "pro", name: "Pro", price: "₹199/mo", icon: <Zap size={18} className="text-ai" />, desc: "Unlimited sync + Real-time data" },
                    { id: "elite", name: "Elite", price: "₹499/mo", icon: <Gem size={18} className="text-purple-400" />, desc: "Personal AI + Tax harvesting" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPlan(p.id)}
                      disabled={isLoading}
                      className={`w-full group p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-ai/50 transition-all text-left flex items-center gap-4 ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform">

                        {p.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-white font-bold text-sm">{p.name}</h4>
                          <span className="text-[10px] font-bold text-ai uppercase tracking-widest">{p.price}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#0b0f19] px-2 text-slate-600">Or use social</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl transition-all font-medium text-sm">
            <Chrome size={18} />
            <span>Sign up with Google</span>
          </button>
        </GlassCard>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Already a member?{" "}
          <Link href="/login" className="text-ai font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
