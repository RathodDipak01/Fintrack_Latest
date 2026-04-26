"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Check, GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";
import { fintrackApi } from "@/lib/api";

// Initial static data before backend fetches
const FALLBACK_INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50', value: '23,897.95', change: '-1.14%', pointsChange: '-275.10', up: false },
  { symbol: '^BSESN', name: 'SENSEX', value: '76,664.21', change: '-1.08%', pointsChange: '-834.00', up: false },
  { symbol: '^NSEBANK', name: 'BANK NIFTY', value: '49,210.50', change: '-0.85%', pointsChange: '-420.30', up: false },
  { symbol: '^CNXIT', name: 'NIFTY IT', value: '38,450.20', change: '+0.45%', pointsChange: '+172.10', up: true },
  { symbol: '^NSEMDCP50', name: 'NIFTY MIDCAP 50', value: '14,120.40', change: '+0.85%', pointsChange: '+118.20', up: true },
  { symbol: '^INDIAVIX', name: 'INDIA VIX', value: '14.50', change: '-2.10%', pointsChange: '-0.31', up: false },
  { symbol: '^GSPC', name: 'S&P 500', value: '5,420.34', change: '+0.31%', pointsChange: '+16.80', up: true },
  { symbol: '^IXIC', name: 'NASDAQ', value: '17,100.12', change: '+0.48%', pointsChange: '+81.20', up: true },
  { symbol: '^DJI', name: 'DOW JONES', value: '41,124.50', change: '+0.10%', pointsChange: '+41.00', up: true },
  { symbol: '^RUT', name: 'RUSSELL 2000', value: '2,114.10', change: '-0.20%', pointsChange: '-4.20', up: false },
  { symbol: '^FTSE', name: 'FTSE 100', value: '8,214.00', change: '+0.30%', pointsChange: '+24.70', up: true },
  { symbol: '^N225', name: 'NIKKEI 225', value: '40,600.00', change: '-1.10%', pointsChange: '-451.00', up: false },
  { symbol: '^HSI', name: 'HANG SENG', value: '18,900.00', change: '+1.50%', pointsChange: '+279.00', up: true },
  { symbol: '^GDAXI', name: 'DAX', value: '19,200.00', change: '+0.25%', pointsChange: '+48.00', up: true },
];

import { Modal, Pill } from "@/components/ui";
import { CandleProxyChart, MobilePriceChart } from "@/components/charts";
import TradingViewWidget from "@/components/tradingview-widget";

const TV_SYMBOL_MAP = {
  '^NSEI': 'NSE:NIFTY',
  '^BSESN': 'BSE:SENSEX',
  '^NSEBANK': 'NSE:BANKNIFTY',
  '^CNXIT': 'NSE:CNXIT',
  '^NSEMDCP50': 'NSE:NIFTY_MID_50',
  '^INDIAVIX': 'NSE:INDIAVIX',
  '^GSPC': 'SP:SPX',
  '^IXIC': 'NASDAQ:IXIC',
  '^DJI': 'DJ:DJI',
  '^RUT': 'RUSSELL:RUT',
  '^FTSE': 'FTSE:UKX',
  '^N225': 'TSE:NI225',
  '^HSI': 'HSI:HSI',
  '^GDAXI': 'XETR:DAX',
};

const DEFAULT_SYMBOLS = ['^NSEI', '^BSESN', '^NSEBANK', '^GSPC', '^IXIC'];

export function MarketTicker() {
  const [masterIndices, setMasterIndices] = useState(FALLBACK_INDICES);
  const [selectedSymbols, setSelectedSymbols] = useState(DEFAULT_SYMBOLS);
  const [isLive, setIsLive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIdxModal, setActiveIdxModal] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("fintrack_market_ticker_symbols");
    if (stored) {
      try {
        setSelectedSymbols(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored symbols:", e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const data = await fintrackApi.getMarketIndices();
        if (data) {
          setMasterIndices(data);
          setIsLive(true);
        }
      } catch (error) {
        console.error("Failed to fetch live market indices:", error);
      }
    }

    fetchIndices();
    const interval = setInterval(fetchIndices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReorder = (newOrder) => {
    setSelectedSymbols(newOrder);
    localStorage.setItem("fintrack_market_ticker_symbols", JSON.stringify(newOrder));
  };

  const toggleSymbol = (symbol) => {
    let newSymbols;
    if (selectedSymbols.includes(symbol)) {
      newSymbols = selectedSymbols.filter((s) => s !== symbol);
    } else {
      newSymbols = [...selectedSymbols, symbol];
    }
    setSelectedSymbols(newSymbols);
    localStorage.setItem("fintrack_market_ticker_symbols", JSON.stringify(newSymbols));
  };

  const renderedIndices = selectedSymbols
    .map(sym => masterIndices.find(idx => idx.symbol === sym))
    .filter(Boolean);

  const availableIndices = masterIndices.filter(idx => !selectedSymbols.includes(idx.symbol));

  return (
    <div className="border-b border-white/5 bg-white/[0.02] flex items-center relative">
      <div className="thin-scrollbar flex-1 flex items-center justify-start gap-8 overflow-x-auto px-4 py-2.5 sm:gap-12">
        {renderedIndices.map((idx) => (
          <button
            key={idx.symbol}
            onClick={() => setActiveIdxModal(idx)}
            className="flex flex-shrink-0 items-center gap-2 text-sm font-medium hover:bg-white/5 px-2 py-1 rounded-md transition-colors"
            title={`View ${idx.name} Detail Chart`}
          >
            <span className="text-white">{idx.name}</span>
            <span className="text-slate-300">{idx.value}</span>
            <span className={`pl-1 ${idx.up ? "text-profit" : "text-loss"}`}>
              {idx.pointsChange} ({idx.change})
            </span>
          </button>
        ))}
      </div>

      <Modal 
        isOpen={!!activeIdxModal} 
        onClose={() => setActiveIdxModal(null)}
        title={`${activeIdxModal?.name} Live Chart`}
      >
        {activeIdxModal && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-white tracking-tight">{activeIdxModal.value}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-lg font-semibold ${activeIdxModal.up ? 'text-profit' : 'text-loss'}`}>
                    {activeIdxModal.pointsChange} ({activeIdxModal.change})
                  </span>
                  <Pill tone={activeIdxModal.up ? 'profit' : 'loss'}>
                    {activeIdxModal.up ? 'Bullish' : 'Bearish'}
                  </Pill>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Last Updated</p>
                <p className="mt-1 text-sm font-mono text-slate-300">Just now</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  {['1D', '5D', '1M', '1Y', 'ALL'].map((r, i) => (
                    <button 
                      key={r}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${i === 0 ? 'bg-white text-midnight' : 'text-slate-500 hover:text-white'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-ai animate-pulse" />
                  Live Tracking Active
                </div>
              </div>
              
              <div className="h-[450px] w-full">
                <TradingViewWidget symbol={TV_SYMBOL_MAP[activeIdxModal.symbol] || activeIdxModal.symbol} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Open', value: activeIdxModal.value },
                { label: 'High', value: (parseFloat(activeIdxModal.value.replace(/,/g, '')) * 1.002).toLocaleString() },
                { label: 'Low', value: (parseFloat(activeIdxModal.value.replace(/,/g, '')) * 0.998).toLocaleString() },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
        
      <div className="flex items-center gap-4 px-4 border-l border-white/10 shrink-0 h-full relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
          title="Customize Indices"
        >
          <Plus size={14} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-4 mt-1 w-64 rounded-md bg-slate-800 border border-white/10 shadow-2xl z-50 py-1 max-h-80 overflow-y-auto thin-scrollbar">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-800/95 backdrop-blur-sm shadow-sm border-b border-white/5 z-10">
              Customize Indices
            </div>
            
            <div className="py-1">
              {/* Selected Indices - Reorderable */}
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase">Active (Drag to reorder)</div>
              <Reorder.Group axis="y" values={selectedSymbols} onReorder={handleReorder} className="space-y-0.5">
                {selectedSymbols.map((symbol) => {
                  const idx = masterIndices.find(i => i.symbol === symbol);
                  if (!idx) return null;
                  return (
                    <Reorder.Item
                      key={symbol}
                      value={symbol}
                      className="w-full flex items-center px-3 py-2 text-sm hover:bg-white/5 transition-colors group cursor-grab active:cursor-grabbing bg-slate-800"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical size={12} className="text-slate-500 shrink-0" />
                        <span className="text-white font-medium truncate">{idx.name}</span>
                      </div>
                      <button
                        onClick={() => toggleSymbol(symbol)}
                        className="p-1 hover:bg-white/10 rounded ml-1"
                      >
                        <Check size={14} className="text-emerald-400" />
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {/* Available Indices */}
              {availableIndices.length > 0 && (
                <>
                  <div className="px-3 py-1.5 mt-2 text-[10px] font-bold text-slate-500 uppercase border-t border-white/5">Available</div>
                  {availableIndices.map((idx) => (
                    <div
                      key={idx.symbol}
                      className="w-full flex items-center px-3 py-2 text-sm hover:bg-white/5 transition-colors group"
                    >
                      <button
                        onClick={() => toggleSymbol(idx.symbol)}
                        className="flex-1 text-left flex items-center justify-between"
                      >
                        <span className="text-slate-400 truncate">{idx.name}</span>
                        <Plus size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {isLive && (
          <div className="flex items-center gap-1.5 pl-2 relative">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
