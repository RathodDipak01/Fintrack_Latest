"use client";

import React, { useEffect, useRef, memo } from 'react';

// Helper to convert symbols from Yahoo format (.NS, .BO) to TradingView format (NSE:, BSE:)
export const formatTvSymbol = (symbol) => {
  if (!symbol) return "NSE:NIFTY";
  
  // Handle Indices (already handled in TV_SYMBOL_MAP usually, but good for fallback)
  if (symbol.startsWith('^')) {
    const indices = {
      '^NSEI': 'NIFTY',
      '^BSESN': 'SENSEX',
      '^NSEBANK': 'BANKNIFTY',
    };
    return indices[symbol] || symbol.substring(1);
  }

  // Handle Indian Stocks
  if (symbol.endsWith('.NS')) {
    return `NSE:${symbol.replace('.NS', '')}`;
  }
  if (symbol.endsWith('.BO')) {
    return `BSE:${symbol.replace('.BO', '')}`;
  }

  return symbol;
};

function TradingViewWidget({ symbol = "NSE:NIFTY", theme = "dark" }) {
  const container = useRef();

  useEffect(
    () => {
      const containerId = `tv-widget-${Math.random().toString(36).substring(7)}`;
      const widgetContainer = container.current.querySelector('.tradingview-widget-container__widget');
      if (widgetContainer) widgetContainer.id = containerId;

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": symbol,
        "interval": "D",
        "timezone": "Asia/Kolkata",
        "theme": theme,
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "calendar": false,
        "details": true,
        "hotlist": false,
        "container_id": containerId
      });
      container.current.appendChild(script);

      return () => {
        if (container.current) {
          container.current.innerHTML = '<div class="tradingview-widget-container__widget h-full w-full"></div>';
        }
      };
    },
    [symbol, theme]
  );

  return (
    <div className="tradingview-widget-container h-full w-full rounded-xl overflow-hidden border border-white/5" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewWidget);
