"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fintrackApi } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/ui";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function BrokerCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Verifying your broker connection...");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    
    const processCallback = async () => {
      // 1. Zerodha (request_token)
      const requestToken = searchParams.get("request_token");
      // 2. Upstox (code)
      const authCode = searchParams.get("code");

      try {
        if (requestToken) {
          setStatus("processing");
          setMessage("Syncing holdings from Zerodha...");
          await fintrackApi.syncZerodha(requestToken);
          setStatus("success");
          setMessage("Zerodha portfolio synced successfully!");
        } else if (authCode) {
          setStatus("processing");
          setMessage("Syncing holdings from Upstox...");
          await fintrackApi.syncUpstox(authCode);
          setStatus("success");
          setMessage("Upstox portfolio synced successfully!");
        } else {
          setStatus("error");
          setMessage("No valid authorization token found in the URL.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "An error occurred during synchronization.");
      }
    };

    processCallback();
  }, [searchParams]);

  const handleDone = () => {
    router.push("/portfolio");
  };

  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="w-full max-w-md p-8 text-center">
          {status === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-ai" />
              <h2 className="text-xl font-semibold text-white">Please wait</h2>
              <p className="text-slate-400">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-profit" />
              <h2 className="text-2xl font-bold text-white">Success!</h2>
              <p className="text-slate-300">{message}</p>
              <button
                onClick={handleDone}
                className="mt-6 w-full rounded-md bg-ai px-4 py-2 font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                Go to Portfolio
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-loss" />
              <h2 className="text-2xl font-bold text-white">Sync Failed</h2>
              <p className="text-slate-300">{message}</p>
              <button
                onClick={() => router.push("/import")}
                className="mt-6 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
