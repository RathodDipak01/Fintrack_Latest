"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Eye, EyeOff, Lock, Chrome } from "lucide-react";
import { GlassCard, Pill } from "@/components/ui";
import { fintrackApi, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("deepak@fintrack.app");
  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("mockpass");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fintrackApi.login({ email, password, otp });
      
      if (response && response.token) {
        setAuthToken(response.token);
        localStorage.setItem("fintrack_user", JSON.stringify(response.user));
        window.location.href = "/dashboard";
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
      setStep(1); // Go back to fix credentials
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#0b0f19] via-[#070a12] to-[#03050a] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-ai/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-profit/5 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] z-10"
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
          <h1 className="text-3xl font-bold text-white">{step === 1 ? "Secure Sign In" : "Verify Identity"}</h1>
          <p className="text-slate-400 mt-2">
            {step === 1 ? "Enter your registered email" : `We've sent a 6-digit code to ${email}`}
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
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-ai/50 focus:border-ai transition-all"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <Link href="#" className="text-xs text-ai hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-slate-500" size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-ai/50 focus:border-ai transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-ai hover:bg-ai/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-glow transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div className="space-y-4 text-center">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-medium text-slate-300">Enter OTP</label>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-ai hover:underline">Change Email?</button>
                  </div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-ai" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/5 border border-ai/30 rounded-xl py-5 pl-10 pr-4 text-white text-3xl font-mono tracking-[0.4em] text-center placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-ai/50 focus:border-ai transition-all"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-profit hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  Verify & Sign In
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0b0f19] px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-xl transition-all font-medium">
            <Chrome size={20} />
            <span>Continue with Google</span>
          </button>
        </GlassCard>

        <p className="text-center mt-8 text-slate-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-ai font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
