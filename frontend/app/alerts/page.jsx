"use client";

import { useEffect, useState } from "react";
import { Bell, ShieldAlert, Trash2, Loader2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { fintrackApi } from "@/lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await fintrackApi.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Failed to load alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id) => {
    if (id.toString().startsWith('dyn-')) {
      // Dynamic alerts can't be deleted from DB usually, but we can filter them locally for this session
      setAlerts(alerts.filter(a => a.id !== id));
      return;
    }
    try {
      await fintrackApi.deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete alert");
    }
  };

  const activeCount = alerts.filter((a) => a.status === "Active" || a.status === "Triggered").length;
  const riskCount = alerts.filter(
    (a) =>
      a.type === "Risk increase" ||
      a.tone === "loss",
  ).length;
  const opportunityCount = alerts.filter(
    (a) => a.type === "Opportunity",
  ).length;

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-warn">
          Intelligence
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          Notifications & Alerts
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Real-time tracking of price targets, risk thresholds, and algorithmic opportunities across your portfolio.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-ai animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">Analyzing market triggers...</p>
        </div>
      ) : error ? (
        <GlassCard className="p-10 flex flex-col items-center border-warn/20">
          <AlertCircle className="h-12 w-12 text-warn mb-4" />
          <p className="text-white font-bold">{error}</p>
          <button onClick={fetchAlerts} className="mt-4 text-ai font-semibold hover:underline">Retry</button>
        </GlassCard>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-3">
            <GlassCard className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bell size={64} className="text-ai" />
              </div>
              <Bell className="text-ai" />
              <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-wider">Active alerts</p>
              <h2 className="mt-2 text-4xl font-bold text-white">{activeCount}</h2>
            </GlassCard>
            
            <GlassCard className="p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert size={64} className="text-warn" />
              </div>
              <ShieldAlert className="text-warn" />
              <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-wider">Risk alerts</p>
              <h2 className="mt-2 text-4xl font-bold text-white">{riskCount}</h2>
            </GlassCard>
            
            <GlassCard className="p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bell size={64} className="text-profit" />
              </div>
              <Bell className="text-profit" />
              <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-wider">Opportunities</p>
              <h2 className="mt-2 text-4xl font-bold text-white">
                {opportunityCount}
              </h2>
            </GlassCard>
          </section>

          <GlassCard className="p-6">
            <SectionHeader
              eyebrow="Monitoring"
              title="Alert Center"
              action={
                <button className="rounded-xl bg-ai shadow-[0_0_15px_rgba(59,130,246,0.3)] px-4 py-2 text-sm font-bold text-white hover:scale-105 transition-all">
                  + Create Custom Alert
                </button>
              }
            />
            
            {alerts.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <Bell className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                <p className="text-slate-500">No active alerts. Add stocks to your watchlist to track moves.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-6">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border border-white/10 bg-white/[0.035] p-5 hover:bg-white/[0.06] transition-all group ${alert.status === 'Triggered' ? 'border-warn/30 bg-warn/5' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <Pill tone={alert.tone}>{alert.type}</Pill>
                        {alert.status === 'Triggered' && <Pill tone="warn">Triggered</Pill>}
                      </div>
                      <button 
                        onClick={() => handleDelete(alert.id)}
                        className="text-slate-600 hover:text-warn transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {alert.title}
                    </h3>
                    
                    <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                      {alert.status === 'Triggered' 
                        ? `This condition was met on ${new Date(alert.createdAt).toLocaleDateString()}.`
                        : "Push and dashboard notifications are enabled for this rule."}
                    </p>
                    
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                      <button className="text-[10px] font-bold text-ai uppercase hover:underline">
                        Edit Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </>
      )}
    </AppShell>
  );
}
