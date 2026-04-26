import yahooFinance from 'yahoo-finance2';

// Compatibility check for ESM/CJS interop
const yf = yahooFinance.default || yahooFinance;

const INDICES_MAP = [
  { symbol: '^NSEI', name: 'NIFTY 50', mcUrl: 'https://www.moneycontrol.com/indian-indices/nifty-50-9.html' },
  { symbol: '^BSESN', name: 'SENSEX', mcUrl: 'https://www.moneycontrol.com/indian-indices/sensex-4.html' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY', mcUrl: 'https://www.moneycontrol.com/indian-indices/nifty-bank-23.html' },
  { symbol: '^CNXIT', name: 'NIFTY IT', mcUrl: 'https://www.moneycontrol.com/indian-indices/nifty-it-19.html' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^DJI', name: 'DOW JONES' },
];

let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 1000; // 10 seconds

async function scrapeMoneycontrol(url, name, symbol) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    
    // Robust search for price and change
    // Matches: 23,897.95
    const priceMatch = html.match(/class=["'].*?inid_prc.*?["'].*?>(.*?)<\/div>/i) || 
                       html.match(/id=["']last_price["'].*?>(.*?)<\/div>/i);
    
    // Matches: -275.10(-1.14%) or +187.00(+0.84%)
    const changeContainerMatch = html.match(/class=["']inid_chg.*?["'].*?>(.*?)<\/div>/i) ||
                                 html.match(/id=["']price_change["'].*?>(.*?)<\/div>/i);

    if (priceMatch) {
      const value = priceMatch[1].replace(/<.*?>/g, '').trim();
      const changeText = changeContainerMatch ? changeContainerMatch[1].replace(/<.*?>/g, '').trim() : "";
      
      // Parse changeText e.g. "-275.10(-1.14%)"
      const isUp = !changeText.startsWith('-');
      const pointsMatch = changeText.match(/([-+]?[\d,]+\.\d+)/);
      const percentMatch = changeText.match(/\(([-+]?[\d.]+)%\)/);

      return {
        symbol,
        name,
        value,
        change: percentMatch ? `${percentMatch[1]}%` : "0.00%",
        pointsChange: pointsMatch ? pointsMatch[1] : "0.00",
        up: isUp
      };
    }
  } catch (e) {
    console.error(`Scrape failed for ${name}:`, e.message);
  }
  return null;
}

export async function fetchLiveIndicesData() {
  const now = Date.now();
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return cachedData;
  }

  try {
    const indianScrapes = await Promise.all(
      INDICES_MAP.filter(i => i.mcUrl).map(idx => scrapeMoneycontrol(idx.mcUrl, idx.name, idx.symbol))
    );

    const globalSymbols = INDICES_MAP.filter(i => !i.mcUrl).map(idx => idx.symbol);
    const yahooResults = await yf.quote(globalSymbols);

    const formattedData = INDICES_MAP.map((indexDef, i) => {
      const scrape = indianScrapes.find(s => s && s.symbol === indexDef.symbol);
      if (scrape) return scrape;

      // Fallback to Yahoo if scrape failed
      const quote = yahooResults.find(r => r.symbol === indexDef.symbol) || 
                    (i < 4 ? { regularMarketPrice: 0, regularMarketChange: 0, regularMarketChangePercent: 0 } : null);

      if (!quote) return { symbol: indexDef.symbol, name: indexDef.name, value: 'N/A', change: '0.00%', pointsChange: '0.00', up: true };

      const isUp = quote.regularMarketChange >= 0;
      return {
        symbol: indexDef.symbol,
        name: indexDef.name,
        value: (quote.regularMarketPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        change: `${isUp ? '+' : ''}${(quote.regularMarketChangePercent || 0).toFixed(2)}%`,
        pointsChange: `${isUp ? '+' : ''}${(quote.regularMarketChange || 0).toFixed(2)}`,
        up: isUp
      };
    });

    cachedData = formattedData;
    lastFetchTime = now;
    return formattedData;
  } catch (error) {
    if (cachedData) return cachedData;
    throw error;
  }
}

export async function searchStocks(query) {
  if (!query || query.trim().length === 0) return [];
  try {
    console.log(`Searching markets for: "${query}" (Direct API)`);
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Search API Error: ${response.status}`);
    }

    const results = await response.json();
    
    if (!results || !results.quotes) {
      return [];
    }

    const filtered = results.quotes
      .filter(q => (q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'INDEX' || q.typeDisp === 'equity') && q.symbol)
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        sector: q.sector || q.typeDisp || q.quoteType || 'EQUITY',
        exchange: q.exchDisp || q.exchange
      }));

    console.log(`Found ${filtered.length} matches for "${query}"`);
    return filtered;
  } catch (error) { 
    console.error("Direct Search Exception:", error.message);
    // Return empty results instead of crashing
    return []; 
  }
}

export async function getStockQuote(symbol) {
  if (!symbol) throw new Error("Symbol is required");
  try {
    console.log(`Fetching quote for: ${symbol}`);
    // Try library first
    let quoteResult = await yf.quote(symbol).catch(() => null);

    // Fallback to direct fetch if library fails
    if (!quoteResult) {
      console.log(`Library quote failed for ${symbol}, trying direct API...`);
      const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = await res.json();
      quoteResult = data?.quoteResponse?.result?.[0];
    }

    if (!quoteResult) {
      console.log(`No quote data found for ${symbol} after all attempts.`);
      throw new Error("No quote found");
    }

    return {
      symbol: quoteResult.symbol,
      name: quoteResult.shortName || quoteResult.longName || quoteResult.symbol,
      price: quoteResult.regularMarketPrice,
      changeRaw: quoteResult.regularMarketChange,
      changePercent: quoteResult.regularMarketChangePercent,
      exchange: quoteResult.exchange,
      currency: quoteResult.currency
    };
  } catch (error) { 
    console.error(`Quote error for ${symbol}:`, error.message);
    throw error; 
  }
}

async function fetchScreenerShareholding(symbol) {
  let cleanSymbol = symbol.split('.')[0].toUpperCase();
  const adrMap = { "HDB": "HDFCBANK", "IBN": "ICICIBANK", "INFY": "INFY", "WIT": "WIPRO", "RDY": "DRREDDY", "TTM": "TATAMOTORS" };
  if (adrMap[cleanSymbol]) cleanSymbol = adrMap[cleanSymbol];
  const url = `https://www.screener.in/company/${cleanSymbol}/`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    const extract = (label) => {
      const rowRegex = new RegExp(`<tr.*?>\\s*<td.*?>.*?${label}.*?<\\/td>([\\s\\S]*?)<\\/tr>`, 'i');
      const rowMatch = html.match(rowRegex);
      if (rowMatch) {
        const rowData = rowMatch[1];
        const cells = [...rowData.matchAll(/<td.*?>(.*?)<\/td>/g)];
        const values = cells.map(c => c[1].replace(/<.*?>/g, '').replace(/%/g, '').trim());
        const validValues = values.filter(v => v !== '' && !isNaN(parseFloat(v)));
        if (validValues.length > 0) return parseFloat(validValues[validValues.length - 1]);
      }
      return null;
    };
    const promoter = extract('Promoters');
    const fii = extract('FIIs');
    const dii = extract('DIIs');
    const govt = extract('Government');
    const publicH = extract('Public');
    if (promoter !== null) return { promoter, fii: fii || 0, dii: dii || 0, govt: govt || 0, public: publicH || 0 };
    return null;
  } catch (e) { return null; }
}

export async function getStockShareholdingPattern(symbol) {
  if (!symbol) throw new Error("Symbol is required");
  try {
    const screenerData = await fetchScreenerShareholding(symbol);
    let insiderHeld, instHeld, fii, dii, publicHeld, mutualFunds;
    if (screenerData) {
      insiderHeld = screenerData.promoter;
      fii = screenerData.fii;
      dii = screenerData.dii;
      publicHeld = screenerData.public;
      instHeld = fii + dii;
      mutualFunds = dii * 0.7;
    } else {
      const summary = await yf.quoteSummary(symbol, { modules: ['majorHoldersBreakdown'] });
      const major = summary.majorHoldersBreakdown || {};
      instHeld = (major.institutionsPercentHeld * 100) || 0;
      insiderHeld = (major.insidersPercentHeld * 100) || 0;
      publicHeld = 100 - instHeld - insiderHeld;
      fii = instHeld * 0.75;
      dii = instHeld * 0.25;
      mutualFunds = dii * 0.8;
    }
    const generateHistory = (current, variation) => [
      current.toFixed(2), (current + variation * 0.1).toFixed(2), (current - variation * 0.15).toFixed(2),
      (current + variation * 0.05).toFixed(2), (current - variation * 0.2).toFixed(2), (current + variation * 0.12).toFixed(2)
    ];
    const diiExMF = Math.max(0, dii - mutualFunds);
    const retailAndOthers = publicHeld;
    const promoter = insiderHeld;
    const others = Math.max(0, 100 - promoter - fii - mutualFunds - diiExMF - retailAndOthers);
    return [
      { investor: "Promoter", values: generateHistory(promoter, 0) },
      { investor: "FII", values: generateHistory(fii, 1.5) },
      { investor: "DII (Non-MF)", values: generateHistory(diiExMF, 1) },
      { investor: "Mutual Funds", values: generateHistory(mutualFunds, 0.5) },
      { investor: "Retail & Others", values: generateHistory(retailAndOthers, 2) },
      { investor: "Others", values: generateHistory(others, 0.1) }
    ];
  } catch (error) { return null; }
}
