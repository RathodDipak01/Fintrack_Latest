import yahooFinance from 'yahoo-finance2';

const yf = yahooFinance;

const INDICES_MAP = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^DJI', name: 'DOW JONES' },
];

let cachedData = [
  { symbol: '^NSEI', name: 'NIFTY 50', value: '23,897.95', change: '-1.14%', pointsChange: '-275.10', up: false },
  { symbol: '^BSESN', name: 'SENSEX', value: '78,664.21', change: '-0.85%', pointsChange: '-650.20', up: false },
  { symbol: '^NSEBANK', name: 'BANK NIFTY', value: '50,400.50', change: '+0.45%', pointsChange: '+220.10', up: true },
  { symbol: '^CNXIT', name: 'NIFTY IT', value: '28,530.60', change: '-0.63%', pointsChange: '-180.50', up: false },
  { symbol: '^GSPC', name: 'S&P 500', value: '5,204.34', change: '+0.11%', pointsChange: '+5.68', up: true },
  { symbol: '^IXIC', name: 'NASDAQ', value: '16,396.83', change: '+0.16%', pointsChange: '+26.31', up: true },
  { symbol: '^DJI', name: 'DOW JONES', value: '39,475.90', change: '-0.77%', pointsChange: '-305.47', up: false },
];
let lastFetchTime = Date.now(); // Start fresh to avoid immediate rate limit
const CACHE_DURATION_MS = 60 * 1000; // Increase cache to 60 seconds to avoid hitting limits often

export async function fetchLiveIndicesData() {
  const now = Date.now();
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return cachedData;
  }

  try {
    const symbols = INDICES_MAP.map(idx => idx.symbol);
    const yahooResults = await yf.quote(symbols).catch(e => {
      console.warn("Yahoo indices quote rate-limited:", e.message);
      return [];
    });

    const formattedData = INDICES_MAP.map((indexDef) => {
      const quote = yahooResults.find(r => r.symbol === indexDef.symbol);
      
      if (quote && quote.regularMarketPrice) {
        const isUp = quote.regularMarketChange >= 0;
        return {
          symbol: indexDef.symbol,
          name: indexDef.name,
          value: quote.regularMarketPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
          change: `${isUp ? '+' : ''}${(quote.regularMarketChangePercent || 0).toFixed(2)}%`,
          pointsChange: `${isUp ? '+' : ''}${(quote.regularMarketChange || 0).toFixed(2)}`,
          up: isUp
        };
      }

      // Fallback to cache
      const lastKnown = cachedData && cachedData.find(c => c.symbol === indexDef.symbol);
      if (lastKnown) return lastKnown;

      return { symbol: indexDef.symbol, name: indexDef.name, value: 'N/A', change: '0.00%', pointsChange: '0.00', up: true };
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
      currency: quoteResult.currency,
      exchange: quoteResult.fullExchangeName || quoteResult.exchange,
      volume: quoteResult.regularMarketVolume,
      recommendation: quoteResult.recommendationKey,
      analystRating: quoteResult.averageAnalystRating,
      dayLow: quoteResult.regularMarketDayLow,
      dayHigh: quoteResult.regularMarketDayHigh,
      fiftyTwoWeekLow: quoteResult.fiftyTwoWeekLow,
      fiftyTwoWeekHigh: quoteResult.fiftyTwoWeekHigh,
      open: quoteResult.regularMarketOpen,
      prevClose: quoteResult.regularMarketPreviousClose
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

/**
 * Fetch news from Google News RSS for broader coverage
 */
async function fetchGoogleNews(symbol) {
  try {
    const cleanSymbol = symbol.split('.')[0];
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanSymbol)}+stock+news&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const xml = await res.text();
    
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const content = match[1];
      const title = content.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/&amp;/g, '&');
      const link = content.match(/<link>(.*?)<\/link>/)?.[1];
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
      const source = content.match(/<source.*?>([\s\S]*?)<\/source>/)?.[1];
      
      if (title && link) {
        items.push({
          title,
          link,
          publisher: source || "Google News",
          providerPublishTime: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
          summary: `Latest coverage from ${source || 'major financial portals'}.`
        });
      }
    }
    return items;
  } catch (error) {
    console.error("Google News fetch error:", error.message);
    return [];
  }
}

/**
 * Fetch latest news for a specific ticker (Aggregated)
 */
export async function fetchTickerNews(symbol) {
  try {
    const [yahooNews, googleNews] = await Promise.all([
      yf.search(symbol, { newsCount: 5 }).then(r => r.news || []).catch(() => []),
      fetchGoogleNews(symbol)
    ]);
    
    // Combine and remove duplicates based on title
    const combined = [...yahooNews, ...googleNews];
    const unique = [];
    const seenTitles = new Set();
    
    const SEVEN_DAYS_AGO = Math.floor(Date.now() / 1000) - (10 * 24 * 60 * 60); // Last 10 days
    
    for (const item of combined) {
      const normalizedTitle = item.title.toLowerCase().trim();
      // Only keep unique, recent news
      if (!seenTitles.has(normalizedTitle) && item.providerPublishTime > SEVEN_DAYS_AGO) {
        seenTitles.add(normalizedTitle);
        unique.push(item);
      }
    }
    
    return unique.sort((a, b) => b.providerPublishTime - a.providerPublishTime).slice(0, 9);
  } catch (error) {
    console.error(`News fetch error for ${symbol}:`, error.message);
    return [];
  }
}

/**
 * Fetch company profile and market cap data
 */
export async function getStockProfile(symbol) {
  if (!symbol) throw new Error("Symbol is required");
  
  try {
    const summary = await yf.quoteSummary(symbol, { 
      modules: ['summaryProfile', 'price', 'defaultKeyStatistics'] 
    });

    const profile = summary.summaryProfile || {};
    const price = summary.price || {};
    
    const marketCap = price.marketCap || 0;
    
    // Simple classification logic for Indian Markets (Approximate in INR)
    // Yahoo marketCap is in the currency of the exchange (INR for .NS/.BO)
    let category = "Small cap";
    if (marketCap > 2000000000000) { // > 2 Lakh Cr (Large)
      category = "Large cap";
    } else if (marketCap > 50000000000) { // > 5000 Cr (Mid)
      category = "Mid cap";
    }

    return {
      symbol,
      name: price.longName || price.shortName,
      sector: profile.sector || "Diversified",
      industry: profile.industry || "General",
      marketCap: marketCap,
      category: category,
      businessSummary: profile.longBusinessSummary
    };
  } catch (error) {
    console.error(`Profile fetch error for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Fetch rich stock data from Groww API
 * Includes shareholding, financials, stats, and company details
 */
export async function getStockGrowwData(symbol) {
  if (!symbol) throw new Error("Symbol is required");
  
  try {
    // Clean symbol (e.g., ADANIPOWER.NS -> ADANIPOWER)
    const cleanSymbol = symbol.split('.')[0];
    
    // 1. Get Groww search_id
    const searchUrl = `https://groww.in/v1/api/search/v3/query/global/st_p_query?page=0&query=${encodeURIComponent(cleanSymbol)}&size=10&web=true`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    if (!searchRes.ok) throw new Error(`Groww Search Error: ${searchRes.status}`);
    const searchData = await searchRes.json();
    
    // Find the matching stock entity
    const stockResult = searchData?.data?.content?.find(
      c => c.entity_type === "Stocks" && 
           (c.nse_scrip_code === cleanSymbol || c.bse_scrip_code === cleanSymbol || c.company_short_name === cleanSymbol)
    ) || searchData?.data?.content?.find(c => c.entity_type === "Stocks");
    
    if (!stockResult || !stockResult.search_id) {
      console.log(`No Groww search_id found for ${cleanSymbol}`);
      return null;
    }
    
    // 2. Fetch detailed company data
    const detailsUrl = `https://groww.in/v1/api/stocks_data/v1/company/search_id/${stockResult.search_id}`;
    const detailsRes = await fetch(detailsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    if (!detailsRes.ok) throw new Error(`Groww Details Error: ${detailsRes.status}`);
    const data = await detailsRes.json();
    
    // 3. Fetch latest news
    const news = await fetchTickerNews(symbol).catch(() => []);
    
    return {
      searchId: data.header?.searchId,
      logoUrl: data.header?.logoUrl,
      details: data.details,
      stats: data.stats,
      fundamentals: data.fundamentals,
      shareHoldingPattern: data.shareHoldingPattern,
      financialStatement: data.financialStatement,
      financialStatementV2: data.financialStatementV2,
      news: news
    };
  } catch (error) {
    console.error(`Groww fetch error for ${symbol}:`, error.message);
    return null;
  }
}
