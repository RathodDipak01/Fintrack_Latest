"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { fintrackApi } from "@/lib/api";

export function StockSearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  
  // Ref for debouncing timeout
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout on new key stroke
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Set loading indicator
    setIsSearching(true);

    // Debounce the network request
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await fintrackApi.searchStocks(q);
        if (data) {
          setResults(data.slice(0, 10)); // Limit to first 10
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms delay

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const showList = open && query.trim().length > 0;

  return (
    <div className={`relative w-full min-w-48 max-w-xl ${className}`}>
      <label htmlFor="stock-search" className="sr-only">
        Search live global stocks
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden
      />
      <input
        id="stock-search"
        type="search"
        autoComplete="off"
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-ai transition-colors"
        placeholder="Search AAPL, Reliance..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 200);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length > 0) {
            router.push(`/stocks?symbol=${encodeURIComponent(results[0].symbol)}`);
            setOpen(false);
          }
        }}
      />
      
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 animate-spin" />
      )}

      {showList && (
        <ul
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto thin-scrollbar rounded-lg border border-white/10 bg-slate-900 py-1 shadow-2xl"
          role="listbox"
        >
          {results.length === 0 && !isSearching ? (
            <li className="px-3 py-3 text-sm text-slate-500">
              No matching tickers found for "{query}"
            </li>
          ) : results.length === 0 && isSearching ? (
            <li className="px-3 py-3 text-sm text-slate-500 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ai"></span>
              </span>
              Scanning markets...
            </li>
          ) : (
            results.map((s, idx) => (
              <li
                key={`${s.symbol}-${idx}`}
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  router.push(`/stocks?symbol=${encodeURIComponent(s.symbol)}`);
                  setOpen(false);
                }}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-white/[0.06] border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{s.symbol}</span>
                  {s.sector && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                      {s.sector}
                    </span>
                  )}
                  {s.exchange && (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                      {s.exchange}
                    </span>
                  )}
                </div>
                <span className="mt-1 block text-slate-400 capitalize truncate">{s.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
