import { SmartAPI } from "smartapi-javascript";
import { generateSync } from "otplib";
import { env } from "../config/env.js";

/**
 * Generates a session with Angel One using TOTP and fetches holdings.
 */
export async function syncAngelOneHoldings(credentials = {}) {
  const isCustom = Boolean(credentials.clientId || credentials.password || credentials.totpSecret || credentials.apiKey);
  
  const clientId = isCustom ? credentials.clientId : env.angelClientId;
  const password = isCustom ? credentials.password : env.angelPassword;
  const totpSecret = isCustom ? credentials.totpSecret : env.angelTotpSecret;
  const apiKey = isCustom ? credentials.apiKey : env.angelApiKey;

  if (!clientId || !password || !totpSecret || !apiKey) {
    throw new Error("All Angel One credentials (Client ID, Password, TOTP Secret, and API Key) are required.");
  }

  const smartApi = new SmartAPI({
    api_key: apiKey,
  });

  try {
    const totp = generateSync({ secret: totpSecret });
    
    const session = await smartApi.generateSession(
      clientId,
      password,
      totp
    );

    if (!session || !session.status) {
      throw new Error(session?.message || "Login failed - check your credentials and TOTP secret.");
    }

    // SmartAPI instance now has tokens set internally by generateSession usually, 
    // but we can ensure it if needed.
    const holdingsResponse = await smartApi.getHolding();

    if (!holdingsResponse || !holdingsResponse.status) {
      throw new Error(holdingsResponse?.message || "Failed to retrieve holdings data.");
    }

    // Map Angel One holdings to our schema
    return holdingsResponse.data.map(item => ({
      symbol: item.tradingsymbol,
      name: item.symbolname || item.tradingsymbol,
      qty: parseFloat(item.quantity),
      avgCost: parseFloat(item.averageprice),
      productType: item.producttype,
      currentPrice: parseFloat(item.ltp),
      // Angel One doesn't provide sector, will be enriched later
    }));
  } catch (error) {
    console.error("Angel One Sync Error:", error.message);
    throw error;
  }
}

export async function fetchLiveMarketData(symbols) {
  // Keeping this for potential future live price updates
  return symbols.map(symbol => ({
    symbol,
    ltp: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
  }));
}

// Global cached session for market data
let globalSmartApi = null;
let sessionTime = 0;

export async function getLiveAngelIndices() {
  if (!env.angelClientId || !env.angelPassword || !env.angelTotpSecret || !env.angelApiKey) {
    return null;
  }

  // Create session if it doesn't exist or is older than 6 hours
  if (!globalSmartApi || (Date.now() - sessionTime > 6 * 60 * 60 * 1000)) {
    const smartApi = new SmartAPI({ api_key: env.angelApiKey });
    const totp = generateSync({ secret: env.angelTotpSecret });
    const session = await smartApi.generateSession(env.angelClientId, env.angelPassword, totp);
    
    if (session && session.status) {
      globalSmartApi = smartApi;
      sessionTime = Date.now();
    } else {
      return null;
    }
  }

  try {
    const md = await globalSmartApi.marketData({
      mode: "FULL",
      exchangeTokens: {
        "NSE": ["26000", "26009"]
      }
    });

    if (md && md.status && md.data && md.data.fetched) {
      const results = [];
      for (const item of md.data.fetched) {
        let symbol = '';
        let name = '';
        if (item.symbolToken === "26000") {
          symbol = '^NSEI';
          name = 'NIFTY 50';
        } else if (item.symbolToken === "26009") {
          symbol = '^NSEBANK';
          name = 'BANK NIFTY';
        }

        if (symbol) {
          const isUp = item.netChange >= 0;
          results.push({
            symbol,
            name,
            value: item.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: `${isUp ? '+' : ''}${(item.percentChange || 0).toFixed(2)}%`,
            pointsChange: `${isUp ? '+' : ''}${(item.netChange || 0).toFixed(2)}`,
            up: isUp
          });
        }
      }
      return results;
    }
  } catch (error) {
    console.error("Angel One getLiveAngelIndices Error:", error.message);
  }
  return null;
}
