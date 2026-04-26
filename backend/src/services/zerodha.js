import { KiteConnect } from "kiteconnect";
import { env } from "../config/env.js";

/**
 * Sync holdings from Zerodha.
 * In a real scenario, this requires a redirect flow to get a request token.
 */
export async function syncZerodhaHoldings(requestToken = null, authToken = null) {
  // If credentials are missing, return mock data for demonstration
  if (!env.zerodhaApiKey || !env.zerodhaApiSecret) {
    console.log("Zerodha credentials missing - using mock data mode.");
    return [
      { symbol: "TCS", name: "Tata Consultancy Services", qty: 10, avgCost: 3200, currentPrice: 3850.50, productType: "CNC" },
      { symbol: "INFY", name: "Infosys", qty: 25, avgCost: 1450, currentPrice: 1620.00, productType: "CNC" },
      { symbol: "HDFCBANK", name: "HDFC Bank", qty: 40, avgCost: 1580, currentPrice: 1675.25, productType: "CNC" }
    ];
  }

  const kc = new KiteConnect({
    api_key: env.zerodhaApiKey
  });

  try {
    // Initial call to get login URL if no token provided
    if (!requestToken) {
      let loginUrl = kc.getLoginURL();
      if (authToken) {
        loginUrl += `&state=${authToken}`;
      }
      return { loginUrl, requiresRedirect: true };
    }

    const session = await kc.generateSession(requestToken, env.zerodhaApiSecret);
    kc.setAccessToken(session.access_token);

    const holdings = await kc.getHoldings();

    return holdings.map(h => ({
      symbol: h.tradingsymbol,
      name: h.tradingsymbol,
      qty: h.quantity,
      avgCost: h.average_price,
      productType: h.product,
      currentPrice: h.last_price
    }));
  } catch (error) {
    console.error("Zerodha API Error:", error.message);
    throw new Error(`Zerodha Sync Failed: ${error.message}`);
  }
}
