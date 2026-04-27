"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Link2,
  Upload,
  XCircle,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { BROKERS, SAMPLE_CSV, parseHoldingsCsv } from "@/lib/portfolio-import";
import { fintrackApi } from "@/lib/api";

export default function ImportPortfolioPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverSummary, setServerSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState(null);
  const [brokerLoading, setBrokerLoading] = useState(null);
  const [connections, setConnections] = useState([]);
  const [showAngelModal, setShowAngelModal] = useState(false);
  const [angelCreds, setAngelCreds] = useState({ clientId: "", password: "", totpSecret: "", apiKey: "" });

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fintrackApi.getBrokerConnections();
      if (res.success) {
        setConnections(res.data.map(c => c.source));
      }
    } catch (e) {
      console.error("Failed to fetch connections:", e);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const runLocalParse = useCallback((text) => {
    setCsvText(text);
    const { holdings, errors } = parseHoldingsCsv(text);
    setPreview(holdings);
    setParseErrors(errors);
    setServerMsg(null);
    setServerSummary(null);
  }, []);

  const onFile = (file) => {
    if (!file) return;
    file.text().then(runLocalParse);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fintrack-sample-holdings.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitCsv = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    setServerMsg(null);
    try {
      const res = await fetch("/api/portfolio-import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = await res.json();
      if (!data.success) {
        setServerMsg(data.message || "Normalization failed");
        setLoading(false);
        return;
      }

      await fintrackApi.bulkAddHoldings(data.holdings);
      setServerMsg("Portfolio imported successfully! Redirecting...");
      if (data.summary) setServerSummary(data.summary);
      setTimeout(() => {
        router.push("/portfolio");
      }, 1500);
    } catch (e) {
      setServerMsg(e.message || "Import failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const connectBroker = async (brokerId) => {
    if (brokerId === "angel_one") {
      setShowAngelModal(true);
      return;
    }
    
    setBrokerLoading(brokerId);
    setBrokerStatus(null);
    try {
      let data;
      if (brokerId === "zerodha") data = await fintrackApi.syncZerodha();
      else if (brokerId === "upstox") data = await fintrackApi.syncUpstox();
      else if (brokerId === "groww") data = await fintrackApi.syncGroww();

      if (data && data.loginUrl) {
        setBrokerStatus("Redirecting to broker login...");
        window.location.href = data.loginUrl;
        return;
      }

      setBrokerStatus(data?.message || "Portfolio synced successfully!");
      fetchConnections();
    } catch (e) {
      setBrokerStatus(e.message || "Broker sync failed.");
    } finally {
      setBrokerLoading(null);
    }
  };

  const handleAngelSubmit = async (e) => {
    e.preventDefault();
    setShowAngelModal(false);
    setBrokerLoading("angel_one");
    setBrokerStatus(null);
    try {
      const data = await fintrackApi.syncAngelOne(angelCreds);
      
      setBrokerStatus(data?.message || "Portfolio synced successfully!");
      fetchConnections();
    } catch (e) {
      setBrokerStatus(e.message || "Broker sync failed.");
    } finally {
      setBrokerLoading(null);
    }
  };

  const disconnectBroker = async (brokerId) => {
    const source = brokerId.toUpperCase();
    if (!confirm(`Are you sure you want to disconnect ${brokerId} and remove its holdings?`)) return;
    
    setBrokerLoading(brokerId);
    try {
      await fintrackApi.disconnectBroker(source);
      setBrokerStatus(`Disconnected ${brokerId} successfully.`);
      fetchConnections();
    } catch (e) {
      setBrokerStatus(`Failed to disconnect ${brokerId}: ${e.message}`);
    } finally {
      setBrokerLoading(null);
    }
  };

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          Data sources
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          Connect broker or import CSV
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Combine all your accounts (Angel One, Zerodha, Upstox, Groww) into a single net worth view. 
          Disconnected brokers will have their holdings removed immediately.
        </p>
        <Link
          href="/portfolio"
          className="mt-4 inline-flex items-center gap-2 text-sm text-ai hover:underline"
        >
          Back to portfolio <ArrowRight size={14} />
        </Link>
      </div>

      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Broker APIs"
          title="Manage Connections"
          action={<Pill tone="warn">Multi-source Enabled</Pill>}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
          {BROKERS.map((b) => {
            const isConnected = connections.includes(b.id.toUpperCase());
            return (
              <div
                key={b.id}
                className={`flex flex-col rounded-lg border p-4 transition-all ${
                  isConnected 
                    ? "border-profit/30 bg-profit/5 shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]" 
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/5 bg-white p-1.5 flex items-center justify-center shadow-lg">

                    {b.logo ? (
                      <img 
                        src={b.logo} 
                        alt={b.name} 
                        className="h-full w-full object-contain"

                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`hidden h-full w-full items-center justify-center text-sm font-bold text-white`}>
                      {b.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  {isConnected ? (
                    <CheckCircle2 size={16} className="text-profit" />
                  ) : (
                    <Link2 size={16} className="text-slate-500" />
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-white flex items-center gap-2">
                  {b.name}
                  {isConnected && <span className="text-[10px] bg-profit/20 text-profit px-1.5 py-0.5 rounded uppercase">Live</span>}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-slate-400">
                  {b.short}
                </p>
                
                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => disconnectBroker(b.id)}
                    disabled={brokerLoading === b.id}
                    className="mt-4 w-full rounded-md border border-loss/40 bg-loss/10 px-3 py-2 text-sm font-semibold text-loss transition hover:bg-loss hover:text-white disabled:opacity-50"
                  >
                    {brokerLoading === b.id ? "Disconnecting…" : "Disconnect"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => connectBroker(b.id)}
                    disabled={brokerLoading !== null}
                    className="mt-4 w-full rounded-md border border-ai/40 bg-ai/10 px-3 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white disabled:opacity-50"
                  >
                    {brokerLoading === b.id ? "Connecting…" : "Connect"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {brokerStatus ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            {brokerStatus}
          </p>
        ) : null}
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="CSV import"
          title="Manual Import (CSV)"
          action={
            <button
              type="button"
              onClick={downloadSample}
              className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-ai/40 hover:text-white"
            >
              <FileSpreadsheet size={14} className="mr-1 inline" />
              Sample CSV
            </button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] mt-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-4 py-10 transition hover:border-ai/40">
            <Upload className="text-ai" size={28} />
            <span className="mt-3 text-sm font-medium text-white">
              Drop a .csv file or click to browse
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div>
            <textarea
              id="csv-paste"
              rows={8}
              value={csvText}
              onChange={(e) => runLocalParse(e.target.value)}
              placeholder="Paste CSV data here..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-ai"
            />
          </div>
        </div>

        {preview.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Preview ({preview.length} positions)</p>
              <button
                type="button"
                onClick={submitCsv}
                disabled={loading}
                className="rounded-md bg-ai px-4 py-2 text-sm font-semibold text-white shadow-glow"
              >
                {loading ? "Importing…" : "Complete Import"}
              </button>
            </div>
          </div>
        )}

        {serverMsg && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-profit/30 bg-profit/10 p-4 text-sm text-slate-200">
            <CheckCircle2 className="mt-0.5 shrink-0 text-profit" size={18} />
            <p>{serverMsg}</p>
          </div>
        )}
      </GlassCard>

      {/* Angel One Modal */}
      {showAngelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Connect Angel One</h2>
              <button onClick={() => setShowAngelModal(false)} className="text-slate-400 hover:text-white transition">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAngelSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Client ID *</label>
                <input 
                  type="text" 
                  required
                  value={angelCreds.clientId}
                  onChange={e => setAngelCreds({...angelCreds, clientId: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-ai"
                  placeholder="e.g. D123456"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Password / PIN *</label>
                <input 
                  type="password" 
                  required
                  value={angelCreds.password}
                  onChange={e => setAngelCreds({...angelCreds, password: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-ai"
                  placeholder="Your 4-digit PIN or Password"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">TOTP Secret *</label>
                <input 
                  type="password" 
                  required
                  value={angelCreds.totpSecret}
                  onChange={e => setAngelCreds({...angelCreds, totpSecret: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-ai"
                  placeholder="e.g. JGPGXIQNI..."
                />
                <p className="mt-1 text-xs text-slate-500">The 2FA secret used to generate TOTP from SmartAPI.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">API Key *</label>
                <input 
                  type="text" 
                  required
                  value={angelCreds.apiKey}
                  onChange={e => setAngelCreds({...angelCreds, apiKey: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-ai"
                  placeholder="Your SmartAPI Key"
                />
                <p className="mt-1 text-xs text-slate-500">API Key is required and must belong to your Client ID.</p>
              </div>
              <button 
                type="submit" 
                className="mt-6 w-full rounded-lg bg-ai py-2.5 font-semibold text-white shadow-glow transition hover:bg-ai/90"
              >
                Connect Account
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
