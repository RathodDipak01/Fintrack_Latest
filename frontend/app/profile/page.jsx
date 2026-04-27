"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  User, 
  Shield, 
  CreditCard, 
  Settings, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Zap,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  LogOut
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { motion } from "framer-motion";

import { useSettings } from "@/context/settings-context";
import { fintrackApi } from "@/lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectionModal, setSelectionModal] = useState(null); // { title, options, current, field }
  
  const { settings, updateSetting, t, formatCurrency } = useSettings();
  
  const [userData, setUserData] = useState({
    name: settings.user.name || "Deepak Rathod",
    email: settings.user.email || "deepak@fintrack.app",
    phone: settings.user.phone || "9876543210",
    location: settings.user.location || "Mumbai, India",
    plan: "Elite",
    memberSince: "April 2024",
    avatar: settings.user.avatar || "https://api.dicebear.com/8.x/initials/png?seed=Deepak&backgroundColor=1a2233,3b82f6&textColor=ffffff"
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("fintrack_user") || "{}");
    if (storedUser.email === "deepak@fintrack.app") {
      setUserData(prev => ({ ...prev, plan: "Elite (Superuser)", email: storedUser.email }));
    } else if (storedUser.plan) {
      setUserData(prev => ({ ...prev, plan: storedUser.plan.charAt(0).toUpperCase() + storedUser.plan.slice(1), email: storedUser.email }));
    }
  }, []);

  useEffect(() => {
    setUserData(prev => ({ ...prev, ...settings.user }));
  }, [settings.user]);

  const [editForm, setEditForm] = useState({ ...userData });

  useEffect(() => {
    if (!isEditing) setEditForm({ ...userData });
  }, [userData, isEditing]);

  const displayAvatar = isEditing
    ? (editForm.avatar && !editForm.avatar.includes("api.dicebear.com") ? editForm.avatar : `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(editForm.name || "User")}&backgroundColor=1a2233,3b82f6&textColor=ffffff`)
    : (settings.user.avatar && !settings.user.avatar.includes("api.dicebear.com") ? settings.user.avatar : `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(settings.user.name || "User")}&backgroundColor=1a2233,3b82f6&textColor=ffffff`);

  const handleSaveProfile = () => {
    updateSetting("user", { ...settings.user, ...editForm });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("fintrack_token");
    localStorage.removeItem("fintrack_user");
    window.location.href = "/";
  };

  const [connectedBrokers, setConnectedBrokers] = useState([]);
  const [brokers, setBrokers] = useState([
    { id: "ZERODHA", name: "Zerodha", status: "Disconnected", lastSync: "Never", color: "text-loss" },
    { id: "ANGEL_ONE", name: "Angel One", status: "Disconnected", lastSync: "Never", color: "text-loss" },
    { id: "UPSTOX", name: "Upstox", status: "Disconnected", lastSync: "Never", color: "text-loss" },
    { id: "GROWW", name: "Groww", status: "Disconnected", lastSync: "Never", color: "text-loss" },
  ]);

  const fetchConnections = async () => {
    try {
      const data = await fintrackApi.getBrokerConnections();
      if (data && Array.isArray(data)) {
        setConnectedBrokers(data);
        setBrokers(prev => prev.map(b => {
          const conn = data.find(c => c.source === b.id);
          if (conn) {
            return { ...b, status: "Connected", lastSync: "Recent", color: "text-profit" };
          }
          return { ...b, status: "Disconnected", lastSync: "Never", color: "text-loss" };
        }));
      }
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleBrokerToggle = async (index) => {
    const broker = brokers[index];
    
    if (broker.status === "Connected") {
      if (confirm(`Disconnect ${broker.name}? This will remove all holdings imported from this source.`)) {
        try {
          await fintrackApi.disconnectBroker(broker.id);
          fetchConnections();
        } catch (err) {
          alert(`Failed to disconnect: ${err.message}`);
        }
      }
    } else {
      // Connect / Sync flow
      try {
        setBrokers(prev => {
          const next = [...prev];
          next[index].status = "Connecting...";
          next[index].color = "text-ai";
          return next;
        });

        let response;
        if (broker.id === "ZERODHA") {
          response = await fintrackApi.syncZerodha();
          if (response?.loginUrl) {
            window.location.href = response.loginUrl;
            return;
          }
        } else if (broker.id === "ANGEL_ONE") {
          await fintrackApi.syncAngelOne();
        } else if (broker.id === "UPSTOX") {
          // For Upstox, we usually need a redirect too, but let's assume it follows Zerodha pattern
          alert("Upstox connection requires redirect. Implementation pending.");
        } else if (broker.id === "GROWW") {
          alert("Groww requires manual token. Use the Import page for full Groww setup.");
        }

        fetchConnections();
      } catch (err) {
        alert(`Sync failed: ${err.message}`);
        fetchConnections();
      }
    }
  };

  const settingOptions = {
    currency: {
      title: "Select Currency",
      options: ["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "AUD ($)", "CAD ($)"],
    },
    language: {
      title: "Select Language",
      options: ["English", "Hindi", "Spanish", "French", "German", "Mandarin", "Japanese"],
    },
    alerts: {
      title: "Market Alerts",
      options: ["Push + Email", "Email Only", "Push Only", "WhatsApp", "SMS Alerts", "None"],
    },
    theme: {
      title: "Color Theme",
      options: ["Dark (Cyber)", "Light (Pro)", "Midnight (OLED)", "Emerald (Forest)", "Amethyst (Royal)", "Crimson (Red)"],
    }
  };

  const activity = [
    { action: "Portfolio rebalanced", time: "3 hours ago", detail: "Trimmed 4% exposure in IT sector" },
    { action: "Login successful", time: "Yesterday, 10:15 AM", detail: "IP: 192.168.1.1 (Chrome / Mac)" },
    { action: "Alert triggered", time: "2 days ago", detail: "Adani Power reached target price ₹245" },
  ];

  const tabs = [
    { id: "overview", label: t("overview") || "Overview", icon: <User size={16} /> },
    { id: "security", label: t("security") || "Security", icon: <Shield size={16} /> },
    { id: "billing", label: t("billing") || "Billing", icon: <CreditCard size={16} /> },
    { id: "preferences", label: t("preferences") || "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-6 md:p-10 transition-all duration-500">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl border-4 border-ai/30 overflow-hidden shadow-glow transition-transform cursor-pointer">

                <Image 
                  src={displayAvatar} 
                  alt="Profile" 
                  width={128} 
                  height={128} 
                  priority
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-ai p-1.5 rounded-full border-4 border-ink">
                <Zap size={16} className="text-white fill-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              {isEditing ? (
                <div className="space-y-3 max-w-md mx-auto md:mx-0">
                  <input 
                    className="w-full bg-white/5 border border-ai/30 rounded-lg px-3 py-2 text-white text-2xl font-bold focus:border-ai outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Your Name"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 text-sm focus:border-ai outline-none"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                    />
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 text-sm focus:border-ai outline-none"
                      value={editForm.avatar?.includes("api.dicebear.com") ? "" : editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      placeholder="Avatar URL (Optional)"
                    />
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 text-sm focus:border-ai outline-none"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      maxLength={10}
                      placeholder="9876543210"
                    />
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 text-sm focus:border-ai outline-none"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{userData.name}</h1>
                    <Pill tone="ai" className="px-3 py-1 text-xs font-bold uppercase tracking-widest">{userData.plan} User</Pill>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-ai" />
                      <span className="text-sm">{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-ai" />
                      <span className="text-sm">{userData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-ai" />
                      <span className="text-sm">{userData.location}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSaveProfile}
                    className="rounded-lg bg-profit px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-600 transition-colors"
                  >
                    {t("save_changes")}
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditForm({ ...userData }); }}
                    className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg bg-ai px-6 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-blue-500 transition-colors"
                  >
                    {t("edit_profile")}
                  </button>
                  <button 
                    onClick={() => window.location.href = "/portfolio"}
                    className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    View Public Portfolio
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-ai/5 rounded-full blur-[100px]" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl max-w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-ai text-white shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                <GlassCard className="p-6">
                  <SectionHeader 
                    eyebrow="Connectivity" 
                    title="Broker connections" 
                    action={<button onClick={() => alert("Redirecting to broker auth...")} className="text-ai text-sm font-semibold hover:underline">Manage all</button>}
                  />
                  <div className="mt-6 space-y-4">
                    {brokers.map((broker, idx) => (
                      <div key={broker.name} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-lg grid place-items-center bg-white/5 text-lg font-bold ${broker.status === "Connected" ? "text-white" : "text-slate-600"}`}>
                            {broker.name[0]}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{broker.name}</p>
                            <p className="text-xs text-slate-500">Last synced: {broker.lastSync}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => handleBrokerToggle(idx)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${broker.status === "Connected" ? "bg-profit" : broker.status === "Connecting..." ? "bg-ai animate-pulse" : "bg-loss"}`} />
                            <span className={`text-xs font-medium ${broker.color}`}>{broker.status}</span>
                          </button>
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-ai transition-colors" />
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => alert("Broker marketplace opening...")}
                      className="w-full mt-2 py-4 border-2 border-dashed border-white/10 rounded-xl text-slate-500 text-sm font-medium hover:border-ai/30 hover:text-ai transition-all"
                    >
                      + Add new broker connection
                    </button>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <SectionHeader eyebrow="Recent" title="Activity timeline" />
                  <div className="mt-6 space-y-8 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />
                    {activity.map((item, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-ink border-2 border-ai/50 grid place-items-center z-10">
                          <div className="h-1.5 w-1.5 rounded-full bg-ai" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold">{item.action}</h4>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{item.time}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </>
            )}

            {activeTab === "security" && (
              <GlassCard className="p-6">
                <SectionHeader eyebrow="Security" title="Protect your account" />
                <div className="mt-8 space-y-6">
                  <div className="flex items-start justify-between p-4 rounded-xl bg-profit/5 border border-profit/10">
                    <div className="flex gap-4">
                      <div className="p-2 rounded-lg bg-profit/20 text-profit">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Two-factor authentication (2FA)</p>
                        <p className="text-sm text-slate-400 mt-1">Your account is secured with 2FA using Google Authenticator.</p>
                      </div>
                    </div>
                    <button onClick={() => alert("2FA Settings opening...")} className="text-xs font-bold text-profit uppercase tracking-widest hover:underline">Manage</button>
                  </div>

                  <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden">
                    {[
                      { label: "Change Password", sub: "Last changed 4 months ago", action: "Update", handler: () => alert("Password reset link sent to your email!") },
                      { label: "Login Alerts", sub: "Get notified of new login attempts", action: "Active", toggle: true, handler: () => alert("Login alerts toggled.") },
                      { label: "Session Management", sub: "Manage active sessions across devices", action: "View", handler: () => alert("No other active sessions found.") },
                      { label: "API Keys", sub: "Manage programmatic access", action: "Generate", handler: () => alert("New API Key generated: FT-XXXX-XXXX") },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="text-slate-200 font-medium">{row.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{row.sub}</p>
                        </div>
                        <button 
                          onClick={row.handler}
                          className="text-xs font-bold text-ai uppercase tracking-widest hover:text-blue-400 transition-colors"
                        >
                          {row.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <GlassCard className="p-6">
                  <SectionHeader eyebrow="Subscription" title="Manage your plan" />
                  <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {[
                      { 
                        name: "Lite", 
                        price: 0, 
                        trial: "7 Days Free",
                        color: "from-slate-400 to-slate-600",
                        features: ["Basic Portfolio Tracking", "2 Broker Connections", "Daily AI Summary", "Standard Analytics"]
                      },
                      { 
                        name: "Pro", 
                        price: 199, 
                        popular: true,
                        color: "from-blue-400 to-indigo-600",
                        features: ["Unlimited Broker Sync", "Real-time Market Data", "Deep-dive AI Insights", "Advanced Technical Charts"]
                      },
                      { 
                        name: "Elite", 
                        price: 499, 
                        color: "from-ai via-purple-500 to-pink-500",
                        features: ["Personal AI Strategist", "Tax Harvesting Signals", "Priority Sync Engine", "Early Beta Access"]
                      }
                    ].map((plan) => (
                      <div 
                        key={plan.name} 
                        className={`relative rounded-2xl border ${plan.popular ? "border-ai/50 bg-ai/5 shadow-[0_0_40px_rgba(59,130,246,0.15)]" : "border-white/10 bg-white/[0.02]"} p-6 flex flex-col transition-all`}

                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ai px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-glow">
                            Most Popular
                          </div>
                        )}
                        <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                        <div className="mt-4 flex items-baseline gap-2">
                          {plan.price === 0 && <span className="text-sm text-slate-500 line-through">₹99</span>}
                          <span className="text-3xl font-bold text-white">{plan.price === 0 ? "FREE" : `₹${plan.price}`}</span>
                          {plan.price !== 0 && <span className="text-slate-500 text-sm">/month</span>}
                          {plan.trial && <span className="ml-1 text-[10px] font-bold text-profit uppercase tracking-widest bg-profit/10 px-2 py-0.5 rounded-full">{plan.trial}</span>}
                        </div>
                        {plan.trial && <p className="mt-1 text-[10px] text-slate-500 italic">then ₹99/month</p>}
                        <ul className="mt-6 space-y-3 flex-1">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                              <CheckCircle2 size={14} className="text-ai shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button className={`mt-8 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${plan.name === userData.plan ? "bg-white/10 text-slate-400 cursor-default" : "bg-white text-ink hover:bg-slate-200 shadow-xl"}`}>
                          {plan.name === userData.plan ? "Current Plan" : plan.trial ? "Start Free Trial" : "Upgrade Now"}
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <SectionHeader eyebrow="Payments" title="Payment Methods & History" />
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Saved Method</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs text-white">VISA</div>
                          <div>
                            <p className="text-white font-medium">•••• 4242</p>
                            <p className="text-[10px] text-slate-500 uppercase">Expires 12/28</p>
                          </div>
                        </div>
                        <button className="text-xs text-ai font-bold uppercase tracking-widest hover:underline">Edit</button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Billing Cycle</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">Monthly Billing</p>
                        <Pill tone="profit">Active</Pill>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Next invoice on May 12, 2026</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === "preferences" && (
              <GlassCard className="p-6">
                <SectionHeader eyebrow="System" title="App Preferences" />
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">Notifications</p>
                      <input type="checkbox" className="accent-ai" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">AI Advice Frequency</p>
                      <select className="bg-ink border border-white/10 rounded text-xs p-1 text-white outline-none">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Real-time</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">Privacy Mode</p>
                      <input type="checkbox" className="accent-ai" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 border-ai/20 bg-ai/[0.03]">
              {(() => {
                const planType = userData.plan.includes("Elite") ? "Elite" : userData.plan.includes("Pro") ? "Pro" : "Lite";
                const planDetails = {
                  Lite: { name: "Fintrack Lite", price: "FREE", color: "text-slate-400" },
                  Pro: { name: "Fintrack Pro", price: "₹199 / month", color: "text-blue-400" },
                  Elite: { name: "Fintrack Elite", price: "₹499 / month", color: "text-ai" }
                }[planType];

                // Dynamic billing calculation
                const now = new Date();
                const nextBilling = new Date();
                nextBilling.setDate(now.getDate() + 18); // Simulation: 18 days left
                const dayOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                const billingDateStr = nextBilling.toLocaleDateString('en-IN', dayOptions);
                const daysLeft = 18; // Keeping it at 18 as per user's current UI context but making it logical

                return (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-lg bg-ai/20 grid place-items-center text-ai">
                        <Zap size={20} className="fill-ai" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{planDetails.name}</h3>
                        <p className={`text-xs font-semibold uppercase tracking-widest ${planDetails.color}`}>Active Plan</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{t("current_plan") || "Current Plan"}</span>
                        <span className="text-white font-semibold">{planDetails.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Next Billing</span>
                        <span className="text-white font-semibold">{billingDateStr}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full mt-6">
                        <div 
                          className="h-full bg-ai rounded-full shadow-glow transition-all duration-1000" 
                          style={{ width: `${(daysLeft / 30) * 100}%` }} 
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 text-center">{daysLeft} days remaining in your current cycle</p>
                      
                      <button 
                        onClick={() => setActiveTab("billing")}
                        className="w-full mt-4 py-3 rounded-xl bg-white text-ink font-bold text-sm shadow-xl hover:bg-slate-200 transition-all"
                      >
                        Change Plan
                      </button>
                    </div>
                  </>
                );
              })()}
            </GlassCard>

            <GlassCard className="p-6">
              <SectionHeader title={t("application_settings")} />
              <div className="mt-6 space-y-5">
                {[
                  { label: t("currency"), field: "currency", icon: <Globe size={16} /> },
                  { label: t("language"), field: "language", icon: <Globe size={16} /> },
                  { label: t("market_alerts"), field: "alerts", icon: <Bell size={16} /> },
                  { label: t("theme"), field: "theme", icon: <Zap size={16} /> },
                ].map((item) => (
                  <div 
                    key={item.label} 
                    onClick={() => setSelectionModal({ ...settingOptions[item.field], field: item.field })} 
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-500 group-hover:text-ai transition-colors">{item.icon}</div>
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{settings[item.field]}</span>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-loss/20 bg-loss/[0.03]">
              <div className="flex items-center gap-3 text-loss mb-4">
                <AlertCircle size={20} />
                <h3 className="font-bold">Account Actions</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sign out of your current session or permanently remove your account data.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-white text-ink font-bold text-xs uppercase tracking-widest hover:bg-slate-200 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
                <button 
                  onClick={() => { if(confirm("Are you ABSOLUTELY sure? This action is irreversible.")) alert("Account deletion request submitted."); }}
                  className="w-full py-2.5 rounded-lg border border-loss/30 text-loss text-[10px] font-bold uppercase tracking-widest hover:bg-loss/10 transition-all"
                >
                  {t("delete_account") || "Delete Account"}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Selection Modal */}
      {selectionModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass w-full max-w-sm rounded-2xl p-6 border border-white/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{t(selectionModal.field) || selectionModal.title}</h3>
              <button 
                onClick={() => setSelectionModal(null)}
                className="text-slate-500 hover:text-white"
              >
                {t("close")}
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto thin-scrollbar pr-2">
              {selectionModal.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    updateSetting(selectionModal.field, opt);
                    setSelectionModal(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    settings[selectionModal.field] === opt 
                      ? "bg-ai text-white shadow-glow" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{opt}</span>
                    {settings[selectionModal.field] === opt && <CheckCircle2 size={16} />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
