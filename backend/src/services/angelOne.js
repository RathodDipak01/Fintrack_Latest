import { SmartAPI } from "smartapi-javascript";
import { env } from "../config/env.js";

export const smartApi = new SmartAPI({
  api_key: env.angelApiKey,
});

// We can implement actual logins or live ticker feeds using smartApi here later.
// Note: Angel One requires a valid TOTP and Client ID to generate an auth token.

export async function fetchLiveMarketData(symbols) {
  // If we don't have token generated, return mock random data just as a scaffold
  return symbols.map(symbol => ({
    symbol,
    ltp: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
  }));
}
