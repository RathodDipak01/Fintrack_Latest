"use client";

import { AppShell } from "@/components/app-shell";
import { WatchlistPanel } from "@/components/watchlist-panel";

export default function WatchlistPage() {
  return (
    <AppShell>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ai">
          Watchlist
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">
          Track before deciding
        </h1>
        <p className="mt-4 max-w-3xl text-slate-400">
          A quick-access dashboard for stocks, prices, changes and alert status
          before they enter the portfolio.
        </p>
      </div>

      <WatchlistPanel
        defaultLayout="grid"
        eyebrow="Stocks"
        title="Priority watchlist"
      />
    </AppShell>
  );
}
