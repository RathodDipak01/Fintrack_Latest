export function MarketTicker() {
  const indices = [
    { name: "NIFTY 50", value: "22,514.65", change: "+0.84%", up: true },
    { name: "SENSEX", value: "74,228.02", change: "+0.78%", up: true },
    { name: "BANK NIFTY", value: "48,060.80", change: "-0.12%", up: false },
    { name: "NIFTY IT", value: "35,124.50", change: "+1.24%", up: true },
    { name: "S&P 500", value: "5,204.34", change: "+0.51%", up: true },
    { name: "NASDAQ", value: "16,400.12", change: "+0.88%", up: true },
  ];

  return (
    <div className="border-b border-white/5 bg-white/[0.02]">
      <div className="thin-scrollbar flex items-center justify-start gap-8 overflow-x-auto px-4 py-2.5 sm:gap-12 md:justify-center">
        {indices.map((idx, i) => (
          <div key={i} className="flex flex-shrink-0 items-center gap-2 text-sm font-medium">
            <span className="text-white">{idx.name}</span>
            <span className="text-slate-300">{idx.value}</span>
            <span className={idx.up ? "text-profit" : "text-loss"}>{idx.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
