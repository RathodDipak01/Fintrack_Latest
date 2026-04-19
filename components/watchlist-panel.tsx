"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, List, Plus, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/ui";
import { watchlist } from "@/lib/portfolio-data";

type SortField = "symbol" | "price" | "change";
type SortDirection = "asc" | "desc";

type LayoutMode = "grid" | "list";

function WatchlistGrid({ data }: { data: typeof watchlist }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((item) => (
        <div key={item.symbol} className="rounded-lg border border-white/10 bg-white/[0.035] p-5 transition hover:border-ai/30 hover:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">{item.symbol}</p>
              <p className="mt-1 text-sm text-slate-500">{item.alert}</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-md bg-panel2 font-semibold text-white">{item.symbol.slice(0, 2)}</div>
          </div>
          <div className="mt-8 flex items-end justify-between">
            <strong className="text-2xl text-white">{item.price}</strong>
            <span className={item.change.startsWith("-") ? "text-loss" : "text-profit"}>{item.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WatchlistTable({ 
  data, onSort, sortField, sortDirection 
}: { 
  data: typeof watchlist, 
  onSort: (field: SortField) => void,
  sortField: SortField,
  sortDirection: SortDirection
}) {
  const renderHeader = (label: string, field: SortField, alignRight = false) => (
    <th className="cursor-pointer px-3 py-2 transition hover:bg-white/5" onClick={() => onSort(field)}>
      <div className={`flex items-center gap-1 ${alignRight ? "justify-end" : ""}`}>
        {label}
        {sortField === field ? (
          sortDirection === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-30" />
        )}
      </div>
    </th>
  );

  return (
    <div className="thin-scrollbar overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
        <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            {renderHeader("Stock", "symbol")}
            <th className="px-3 py-2">Alert</th>
            {renderHeader("Price", "price", true)}
            {renderHeader("Change", "change", true)}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.symbol} className="rounded-lg bg-white/[0.035] text-sm text-slate-300 transition hover:bg-white/[0.07]">
              <td className="rounded-l-lg px-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-panel2 text-xs font-semibold text-white">{item.symbol.slice(0, 2)}</div>
                  <span className="font-semibold text-white">{item.symbol}</span>
                </div>
              </td>
              <td className="max-w-[280px] px-3 py-4 text-slate-400">{item.alert}</td>
              <td className="px-3 py-4 text-right font-semibold text-white">{item.price}</td>
              <td className={`rounded-r-lg px-3 py-4 text-right font-semibold ${item.change.startsWith("-") ? "text-loss" : "text-profit"}`}>{item.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WatchlistPanel({
  defaultLayout = "grid",
  eyebrow = "Stocks",
  title = "Priority watchlist",
  addLabel = "Add to watchlist"
}: {
  defaultLayout?: LayoutMode;
  eyebrow?: string;
  title?: string;
  addLabel?: string;
}) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout);
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedWatchlist = useMemo(() => {
    return [...watchlist].sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];

      if (sortField === "price") {
        valA = parseFloat(a.price.replace(/[^\d.-]/g, ""));
        valB = parseFloat(b.price.replace(/[^\d.-]/g, ""));
      } else if (sortField === "change") {
        valA = parseFloat(a.change.replace(/[^\d.-]/g, ""));
        valB = parseFloat(b.change.replace(/[^\d.-]/g, ""));
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortField, sortDirection]);

  return (
    <GlassCard className="p-6">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {layout === "grid" && (
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [f, d] = e.target.value.split("-") as [SortField, SortDirection];
                  setSortField(f);
                  setSortDirection(d);
                }}
                className="h-[34px] rounded-md border border-white/10 bg-transparent px-2 text-sm text-slate-300 outline-none [&>option]:bg-midnight"
              >
                <option value="symbol-asc">Symbol (A-Z)</option>
                <option value="symbol-desc">Symbol (Z-A)</option>
                <option value="price-desc">Price (High-Low)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="change-desc">Change (High-Low)</option>
                <option value="change-asc">Change (Low-High)</option>
              </select>
            )}
            <div className="flex rounded-lg border border-white/10 p-0.5" role="group" aria-label="Watchlist layout">
              <button
                type="button"
                onClick={() => setLayout("grid")}
                aria-pressed={layout === "grid"}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  layout === "grid" ? "bg-ai/20 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutGrid size={14} aria-hidden />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setLayout("list")}
                aria-pressed={layout === "list"}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  layout === "list" ? "bg-ai/20 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List size={14} aria-hidden />
                List
              </button>
            </div>
            <button type="button" className="rounded-md bg-ai px-3 py-2 text-sm font-semibold text-white">
              <Plus size={14} className="mr-1 inline" aria-hidden />
              {addLabel}
            </button>
          </div>
        }
      />
      {layout === "grid" ? (
        <WatchlistGrid data={sortedWatchlist} />
      ) : (
        <WatchlistTable 
          data={sortedWatchlist} 
          sortField={sortField} 
          sortDirection={sortDirection} 
          onSort={handleSort} 
        />
      )}
    </GlassCard>
  );
}
