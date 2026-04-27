"use client";

import React, { useEffect, useRef, memo } from 'react';

/**
 * Format symbols for TradingView. 
 * Converts Yahoo format (^NSEI, .NS) to TradingView format (NSE:NIFTY, etc.)
 */
export const formatTvSymbol = (symbol) => {
  if (!symbol) return "NSE:NIFTY";
  
  const map = {
    '^NSEI': 'NSE:NIFTY',
    '^BSESN': 'BSE:SENSEX',
    '^NSEBANK': 'NSE:BANKNIFTY',
    '^CNXIT': 'NSE:CNXIT',
    '^GSPC': 'SP:SPX',
    '^IXIC': 'NASDAQ:IXIC',
    '^DJI': 'DJ:DJI',
    '^INDIAVIX': 'NSE:INDIAVIX',
  };

  if (map[symbol]) return map[symbol];

  // Indian Stocks
  if (symbol.endsWith('.NS')) return `NSE:${symbol.replace('.NS', '')}`;
  if (symbol.endsWith('.BO')) return `BSE:${symbol.replace('.BO', '')}`;
  
  // Clean caret
  if (symbol.startsWith('^')) return symbol.substring(1);

  return symbol;
};

function TradingViewWidget({ symbol = "NSE:NIFTY", theme = "dark" }) {
  const container = useRef();
  const symbolToUse = formatTvSymbol(symbol);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';
    
    const div = document.createElement('div');
    div.className = 'tradingview-widget-container__widget h-full w-full';
    container.current.appendChild(div);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbolToUse,
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
      "width": "100%",
      "height": "100%",
    });
    
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbolToUse, theme]);

  return (
    <div 
      className="tradingview-widget-container h-full w-full rounded-2xl overflow-hidden bg-midnight/50" 
      ref={container}
    />
  );
}

export default memo(TradingViewWidget);
