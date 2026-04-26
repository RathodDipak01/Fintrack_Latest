import * as UpstoxClient from "upstox-js-sdk";
import { env } from "../config/env.js";

/**
 * Sync holdings from Upstox.
 */
export async function syncUpstoxHoldings(authCode = null, authToken = null) {
  // Mock Mode if credentials missing
  if (!env.upstoxApiKey || !env.upstoxApiSecret) {
    console.log("Upstox credentials missing - using mock data mode.");
    return [
      { symbol: "RELIANCE", name: "Reliance Industries", qty: 15, avgCost: 2450, currentPrice: 2985.40, productType: "DELIVERY" },
      { symbol: "TATAMOTORS", name: "Tata Motors", qty: 80, avgCost: 610, currentPrice: 940.00, productType: "DELIVERY" },
      { symbol: "ICICIBANK", name: "ICICI Bank", qty: 50, avgCost: 890, currentPrice: 1080.50, productType: "DELIVERY" }
    ];
  }

  try {
    if (!authCode) {
      // Return redirect info
      const redirectUri = encodeURIComponent(`${env.nodeEnv === 'production' ? 'https://fintrack.ai' : 'http://localhost:4000'}/api/broker/callback/upstox`);
      const loginUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${env.upstoxApiKey}&redirect_uri=${redirectUri}${authToken ? `&state=${authToken}` : ''}`;
      return { loginUrl, requiresRedirect: true };
    }

    const defaultClient = UpstoxClient.ApiClient.instance;
    const Oauth2 = defaultClient.authentications['Oauth2'];
    // In a real flow, we would exchange authCode for an actual accessToken here.
    // For now we set it directly to show the pattern.
    Oauth2.accessToken = authCode;

    const apiInstance = new UpstoxClient.PortfolioApi();
    
    return new Promise((resolve, reject) => {
      apiInstance.getHoldings('2.0', (error, data, response) => {
        if (error) {
          reject(error);
        } else {
          const mapped = data.data.map(h => ({
            symbol: h.trading_symbol,
            name: h.company_name || h.trading_symbol,
            qty: h.quantity,
            avgCost: h.avg_price,
            productType: h.product,
            currentPrice: h.last_price
          }));
          resolve(mapped);
        }
      });
    });
  } catch (error) {
    console.error("Upstox API Error:", error);
    throw new Error(`Upstox Sync Failed: ${error.message}`);
  }
}

/**
 * Search for instrument key by symbol
 */
export async function searchInstrument(symbol) {
  try {
    const response = await fetch(`https://api.upstox.com/v2/market/search/instrument/${encodeURIComponent(symbol)}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (data.status === 'success' && data.data.length > 0) {
      // Find exact match or first result
      const match = data.data.find(i => i.trading_symbol === symbol && i.exchange === 'NSE') || data.data[0];
      return match.instrument_key;
    }
    return null;
  } catch (err) {
    console.error("Upstox Search Error:", err);
    return null;
  }
}

/**
 * Get historical candle data from Upstox
 */
export async function getHistoricalData(symbol, interval = '1day') {
  // Use mock data if no credentials or if request fails
  const mockData = Array.from({ length: 100 }).map((_, i) => ({
    time: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    open: 3000 + Math.random() * 500,
    high: 3600 + Math.random() * 500,
    low: 2900 + Math.random() * 500,
    close: 3400 + Math.random() * 500,
  }));

  if (!env.upstoxApiKey || !env.upstoxApiSecret) {
    return mockData;
  }

  try {
    const key = await searchInstrument(symbol);
    if (!key) return mockData;

    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Upstox Historical API requires an access token. 
    // For this implementation, we try to use a stored token or return mock if none.
    const token = process.env.UPSTOX_ACCESS_TOKEN; // In a real app, this is managed per user
    if (!token) return mockData;

    const response = await fetch(`https://api.upstox.com/v2/historical-candle/${key}/${interval}/${toDate}/${fromDate}`, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    
    if (result.status === 'success' && result.data.candles) {
      return result.data.candles.map(c => ({
        time: c[0].split('T')[0],
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5]
      })).reverse(); // Upstox returns newest first, we want oldest first for charts
    }
    return mockData;
  } catch (err) {
    console.error("Upstox Historical Error:", err);
    return mockData;
  }
}
