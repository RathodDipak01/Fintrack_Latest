"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSpreadsheet, Link2, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, Pill, SectionHeader } from "@/components/ui";
import { BROKERS, SAMPLE_CSV, parseHoldingsCsv, type BrokerId, type ParsedHolding } from "@/lib/portfolio-import";
import { fintrackApi } from "@/lib/api";

export default function ImportPortfolioPage() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<ParsedHolding[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverSummary, setServerSummary] = useState<{ positions: number; investedApprox: number; unrealizedApprox: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState<string | null>(null);
  const [brokerLoading, setBrokerLoading] = useState<BrokerId | null>(null);

  const runLocalParse = useCallback((text: string) => {
    setCsvText(text);
    const { holdings, errors } = parseHoldingsCsv(text);
    setPreview(holdings);
    setParseErrors(errors);
    setServerMsg(null);
    setServerSummary(null);
  }, []);

  const onFile = (file: File | null) => {
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
      // 1. Get summary/normalization from Next.js local API (optional but keeps summary logic separate)
      const res = await fetch("/api/portfolio-import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText })
      });
      const data = await res.json();
      
      if (!data.success) {
        setServerMsg(data.message || "Normalization failed");
        setLoading(false);
        return;
      }

      // 2. Persist to Express Backend
      try {
        await fintrackApi.bulkAddHoldings(data.holdings);
      } catch (e: any) {
        if (e.message.includes("Authentication") || e.message.includes("401")) {
          setServerMsg("Authentication required. Please login first to save your portfolio.");
        } else {
          setServerMsg("Import failed: " + e.message);
        }
        setLoading(false);
        return;
      }
      
      setServerMsg("Portfolio imported successfully! Redirecting...");
      if (data.summary) setServerSummary(data.summary);
      
      // 3. Redirect to portfolio page after a short delay
      setTimeout(() => {
        router.push("/portfolio");
      }, 1500);

    } catch (e: any) {
      setServerMsg(e.message || "Import failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const connectBroker = async (brokerId: BrokerId) => {
    setBrokerLoading(brokerId);
    setBrokerStatus(null);
    try {
      const res = await fetch("/api/portfolio-import/broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId })
      });
      const data = await res.json();
      setBrokerStatus(data.message + (data.documentationHint ? ` — ${data.documentationHint}` : ""));
    } catch {
      setBrokerStatus("Could not reach import service.");
    } finally {
      setBrokerLoading(null);
    }
  };

  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">Data sources</p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">Connect broker or import CSV</h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          Fintrack can analyze holdings from{" "}
          <strong className="text-slate-300">Angel One</strong>, <strong className="text-slate-300">Zerodha</strong>,{" "}
          <strong className="text-slate-300">Groww</strong>, and <strong className="text-slate-300">Upstox</strong> APIs when
          connected, or from a <strong className="text-slate-300">CSV export</strong> of your positions. Live API sync is wired
          in stages; CSV works end-to-end for analysis in this prototype.
        </p>
        <Link href="/portfolio" className="mt-4 inline-flex items-center gap-2 text-sm text-ai hover:underline">
          Back to portfolio <ArrowRight size={14} />
        </Link>
      </div>

      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Broker APIs"
          title="Connect your broker"
          action={<Pill tone="warn">OAuth in production</Pill>}
        />
        <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-400">
          Each integration uses the broker&apos;s official API (e.g. Zerodha Kite Connect, Angel SmartAPI, Upstox developer API).
          Groww may require export workflows until programmatic access matches your account. Buttons below confirm the planned
          flow; credentials are never stored in this demo.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BROKERS.map((b) => (
            <div key={b.id} className="flex flex-col rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-panel2 text-sm font-bold text-white">
                  {b.name.slice(0, 2).toUpperCase()}
                </div>
                <Link2 size={16} className="text-slate-500" aria-hidden />
              </div>
              <h3 className="mt-3 font-semibold text-white">{b.name}</h3>
              <p className="mt-2 flex-1 text-xs leading-5 text-slate-400">{b.short}</p>
              <button
                type="button"
                onClick={() => connectBroker(b.id)}
                disabled={brokerLoading !== null}
                className="mt-4 w-full rounded-md border border-ai/40 bg-ai/10 px-3 py-2 text-sm font-semibold text-ai transition hover:bg-ai hover:text-white disabled:opacity-50"
              >
                {brokerLoading === b.id ? "Opening flow…" : "Connect"}
              </button>
            </div>
          ))}
        </div>
        {brokerStatus ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">{brokerStatus}</p>
        ) : null}
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="CSV import"
          title="Upload or paste holdings"
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
        <p className="mb-4 max-w-3xl text-sm text-slate-400">
          Use columns such as <span className="text-slate-300">Instrument</span>, <span className="text-slate-300">Product</span>,{" "}
          <span className="text-slate-300">Quantity</span>, <span className="text-slate-300">Average Price</span>, optional{" "}
          <span className="text-slate-300">LTP</span> and <span className="text-slate-300">Name</span>. Or omit headers and
          provide three columns: symbol, qty, average cost.
        </p>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-4 py-10 transition hover:border-ai/40">
            <Upload className="text-ai" size={28} />
            <span className="mt-3 text-sm font-medium text-white">Drop a .csv file or click to browse</span>
            <span className="mt-1 text-xs text-slate-500">Broker exports often work after minor column cleanup</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div>
            <label htmlFor="csv-paste" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Paste CSV
            </label>
            <textarea
              id="csv-paste"
              rows={10}
              value={csvText}
              onChange={(e) => runLocalParse(e.target.value)}
              placeholder={SAMPLE_CSV.trim()}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-ai"
            />
          </div>
        </div>

        {parseErrors.length > 0 ? (
          <div className="mt-4 rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
            <p className="font-medium">Parse notes</p>
            <ul className="mt-2 list-inside list-disc text-xs text-slate-300">
              {parseErrors.slice(0, 8).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {preview.length > 0 ? (
          <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">
                Preview <span className="text-slate-400">({preview.length} positions)</span>
              </p>
              <button
                type="button"
                onClick={submitCsv}
                disabled={loading}
                className="rounded-md bg-ai px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send for analysis"}
              </button>
            </div>
            <div className="thin-scrollbar overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Symbol</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Qty</th>
                    <th className="px-2 py-2">Avg</th>
                    <th className="px-2 py-2">LTP</th>
                    <th className="px-2 py-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((h, i) => (
                    <tr key={`${h.symbol}-${i}`} className="rounded-md bg-white/[0.035] text-slate-300">
                      <td className="px-2 py-2 font-semibold text-white">{h.symbol}</td>
                      <td className="px-2 py-2 text-xs">{h.productType ?? "—"}</td>
                      <td className="px-2 py-2">{h.qty}</td>
                      <td className="px-2 py-2">₹{h.avgCost.toLocaleString("en-IN")}</td>
                      <td className="px-2 py-2">{h.currentPrice != null ? `₹${h.currentPrice.toLocaleString("en-IN")}` : "—"}</td>
                      <td className="px-2 py-2 text-slate-500">{h.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {serverMsg ? (
          <div className="mt-4 flex flex-wrap items-start gap-3 rounded-lg border border-profit/30 bg-profit/10 p-4 text-sm text-slate-200">
            <CheckCircle2 className="mt-0.5 shrink-0 text-profit" size={18} />
            <div>
              <p>{serverMsg}</p>
              {serverSummary ? (
                <ul className="mt-2 text-xs text-slate-400">
                  <li>Positions: {serverSummary.positions}</li>
                  <li>Invested (approx): ₹{serverSummary.investedApprox.toLocaleString("en-IN")}</li>
                  <li>Unrealized P&amp;L vs cost (approx): ₹{serverSummary.unrealizedApprox.toLocaleString("en-IN")}</li>
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}
      </GlassCard>
    </AppShell>
  );
}
