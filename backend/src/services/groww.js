import { env } from "../config/env.js";

/**
 * Sync holdings from Groww.
 * Handles both standard API keys and JWT-based authorization tokens.
 */
export async function syncGrowwHoldings(accessToken = null) {
  // Use either the passed accessToken or the one from environment
  const token = accessToken || env.growwApiKey;

  // Mock Mode if credentials missing
  if (!env.growwApiKey || env.growwApiKey === "your_groww_api_key_here" || !env.growwApiSecret) {
    console.log("Groww credentials missing - using mock data mode.");
    return [
      { symbol: "ZOMATO", name: "Zomato Ltd", qty: 200, avgCost: 95, currentPrice: 185.30, productType: "EQUITY" },
      { symbol: "IRFC", name: "Indian Railway Finance", qty: 500, avgCost: 45, currentPrice: 142.00, productType: "EQUITY" },
      { symbol: "BHEL", name: "Bharat Heavy Electricals", qty: 150, avgCost: 120, currentPrice: 260.50, productType: "EQUITY" }
    ];
  }

  try {
    // Sanitize and validate token to prevent ByteString crash
    const cleanToken = token.replace(/[\u2026\u200B]/g, "..."); // replace ellipsis with standard dots to check
    if (cleanToken.includes("...") || cleanToken.length < 100) {
      throw new Error("Invalid Access Token: It looks like you copied a truncated token. In the Network tab, please RIGHT-CLICK the Authorization value and select 'Copy Value' to get the full token.");
    }
    
    // Groww 2026 Authentication Pattern:
    // 1. Authorization: Bearer <JWT_TOKEN>
    // 2. X-API-KEY: <IDENTIFIER>
    // 3. X-API-SECRET: <SECRET>
    
    const headers = {
      "Authorization": `Bearer ${cleanToken}`,
      "X-API-VERSION": "1.0",
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    console.log("Groww Sync Attempt - Headers prepared (Secret masked)");
    
    const response = await fetch("https://api.groww.in/v1/holdings/user", {
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groww API Error (${response.status}):`, errorText);
      
      if (response.status === 403) {
        throw new Error("Groww Sync Failed (403 Forbidden). Your Access Token has likely expired or is being blocked by Cloudflare. Please provide a fresh token.");
      }
      throw new Error(`Groww API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mapping standard Groww response structure
    const holdings = data.data || data.holdings || [];
    return holdings.map(h => ({
      symbol: h.trading_symbol || h.symbol || h.instrument_symbol,
      name: h.company_name || h.symbol || h.instrument_name,
      qty: h.quantity || h.qty,
      avgCost: h.average_price || h.avg_price || h.cost_price,
      productType: "EQUITY",
      currentPrice: h.last_price || h.ltp || h.close_price
    }));
  } catch (error) {
    console.error("Groww API Sync Error:", error);
    throw new Error(`Groww Sync Failed: ${error.message}`);
  }
}
