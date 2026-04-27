"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/ui";
import { fintrackApi } from "@/lib/api";

function WatchlistGrid({ data, onDelete }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-all hover:border-ai/30 hover:bg-white/[0.06] group relative"
        >
          <button
            onClick={() => onDelete(item.id)}
            className="absolute top-4 right-4 p-2 text-slate-600 hover:text-warn opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-white">{item.symbol}</p>
              <p className="mt-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {item.alertText || "Tracking live..."}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-panel2 font-black text-white text-xs border border-white/5">
              {item.symbol.slice(0, 2)}
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                CURRENT PRICE
              </span>
              <strong className="text-2xl text-white">
                ₹{item.price?.toLocaleString("en-IN") || "0.00"}
              </strong>
            </div>
            <div
              className={`flex items-center gap-1 font-bold ${
                item.changePercent >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {item.changePercent >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {item.changePercent >= 0 ? "+" : ""}
              {item.changePercent}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WatchlistTable({ data, onSort, sortField, sortDirection, onDelete }) {
  const renderHeader = (label, field, alignRight = false) => (
    <th
      className="cursor-pointer px-3 py-2 transition hover:bg-white/5"
      onClick={() => onSort(field)}
    >
      <div
        className={`flex items-center gap-1 ${
          alignRight ? "justify-end" : ""
        }`}
      >
        {label}
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-30" />
        )}
      </div>
    </th>
  );

  return (
    <div className="thin-scrollbar overflow-x-auto mt-4">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-3 text-left">
        <thead className="text-[10px] uppercase font-black tracking-widest text-slate-500">
          <tr>
            {renderHeader("Stock", "symbol")}
            <th className="px-3 py-2">Status</th>
            {renderHeader("Price", "price", true)}
            {renderHeader("Change", "changePercent", true)}
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="rounded-xl bg-white/[0.035] text-sm text-slate-300 transition hover:bg-white/[0.07] group"
            >
              <td className="rounded-l-xl px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-panel2 text-[10px] font-black text-white border border-white/5">
                    {item.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.name || "Stock"}
                    </span>
                  </div>
                </div>
              </td>
              <td className="max-w-[200px] px-3 py-4 text-xs font-medium text-slate-400 italic">
                {item.alertText}
              </td>
              <td className="px-3 py-4 text-right font-bold text-white">
                ₹{item.price?.toLocaleString("en-IN")}
              </td>
              <td
                className={`px-3 py-4 text-right font-bold ${
                  item.changePercent >= 0 ? "text-profit" : "text-loss"
                }`}
              >
                {item.changePercent >= 0 ? "+" : ""}
                {item.changePercent}%
              </td>
              <td className="rounded-r-xl px-4 py-4 text-right">
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-600 hover:text-warn transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </td>
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
  addLabel = "Add Stock",
}) {
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState(defaultLayout);
  const [sortField, setSortField] = useState("symbol");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await fintrackApi.getWatchlist();
      setWatchlistData(data);
    } catch (err) {
      console.error("Watchlist Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSymbol) return;
    try {
      setAdding(true);
      await fintrackApi.addToWatchlist({ symbol: newSymbol });
      setNewSymbol("");
      setShowAddForm(false);
      fetchWatchlist();
    } catch (err) {
      alert(err.message || "Failed to add stock");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fintrackApi.removeFromWatchlist(id);
      setWatchlistData(watchlistData.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to remove stock");
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedWatchlist = useMemo(() => {
    return [...watchlistData].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [watchlistData, sortField, sortDirection]);

  return (
    <GlassCard className="p-6">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex rounded-xl border border-white/10 p-0.5 bg-white/5"
              role="group"
            >
              <button
                type="button"
                onClick={() => setLayout("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase transition ${
                  layout === "grid"
                    ? "bg-ai text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutGrid size={12} />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setLayout("list")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase transition ${
                  layout === "list"
                    ? "bg-ai text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List size={12} />
                List
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-xl bg-ai shadow-[0_0_15px_rgba(59,130,246,0.3)] px-4 py-2 text-xs font-bold text-white hover:scale-105 transition-all"
            >
              <Plus size={14} className="mr-1 inline" />
              {addLabel}
            </button>
          </div>
        }
      />

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="mt-6 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Enter Stock Symbol (e.g. RELIANCE, AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none focus:border-ai/50 transition-all"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="bg-white text-midnight font-bold px-6 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {adding ? <Loader2 className="animate-spin" size={18} /> : "Add"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-ai animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse text-sm">
            Fetching real-time quotes...
          </p>
        </div>
      ) : sortedWatchlist.length === 0 ? (
        <div className="py-20 text-center">
          <TrendingUp className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">
            Your watchlist is empty. Add stocks to track their live performance.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {layout === "grid" ? (
            <WatchlistGrid data={sortedWatchlist} onDelete={handleDelete} />
          ) : (
            <WatchlistTable
              data={sortedWatchlist}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </GlassCard>
  );
}
