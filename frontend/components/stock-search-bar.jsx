"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { holdings } from "@/lib/portfolio-data";

const searchIndex = holdings.map((h) => ({ symbol: h.symbol, name: h.name }));

export function StockSearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [query]);

  const showList = open && query.trim().length > 0;

  return (
    <div className={`relative max-w-xl ${className}`}>
      <label htmlFor="stock-search" className="sr-only">
        Search stocks by symbol or company name
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden
      />
      <input
        id="stock-search"
        type="search"
        autoComplete="off"
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-ai"
        placeholder="Search symbol or company…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 160);
        }}
      />

      {showList && (
        <ul
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/10 bg-ink py-1 shadow-glass"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-slate-500">
              No matches in your holdings sample
            </li>
          ) : (
            filtered.map((s) => (
              <li
                key={s.symbol}
                role="option"
                className="cursor-pointer px-3 py-2.5 text-sm hover:bg-white/[0.06]"
              >
                <span className="font-semibold text-white">{s.symbol}</span>
                <span className="ml-2 text-slate-400">{s.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
