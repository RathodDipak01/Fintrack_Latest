import { SmartAPI } from "smartapi-javascript";
import { generateSync } from "otplib";
import { env } from "../config/env.js";

/**
 * Generates a session with Angel One using TOTP and fetches holdings.
 */
export async function syncAngelOneHoldings() {
  if (!env.angelClientId || !env.angelPassword || !env.angelTotpSecret || !env.angelApiKey) {
    throw new Error("Angel One credentials (Client ID, Password, TOTP Secret, or API Key) are not configured.");
  }

  const smartApi = new SmartAPI({
    api_key: env.angelApiKey,
  });

  try {
    const totp = generateSync({ secret: env.angelTotpSecret });
    
    const session = await smartApi.generateSession(
      env.angelClientId,
      env.angelPassword,
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
