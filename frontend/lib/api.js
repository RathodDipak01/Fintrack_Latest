/**
 * API fetching utility for the Fintrack Next.js frontend to interact with the Express backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("fintrack_token");
  }
  return null;
}

export function setAuthToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fintrack_token", token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fintrack_token");
  }
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      removeAuthToken(); // Token likely expired or invalid
    }
    throw new Error(body?.message || "An API error occurred");
  }

  return body?.data || body;
}

export const fintrackApi = {
  // --- Auth ---
  login: (data) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  signup: (data) =>
    fetchWithAuth("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => fetchWithAuth("/auth/logout", { method: "POST" }),
  getMe: () => fetchWithAuth("/auth/me", { method: "GET" }),
  updateProfile: (data) => fetchWithAuth("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),

  // --- Portfolio Analysis ---
  getHoldings: () => fetchWithAuth("/portfolio/holdings", { method: "GET" }),
  getSummary: () => fetchWithAuth("/portfolio/summary", { method: "GET" }),
  getAllocation: () =>
    fetchWithAuth("/portfolio/allocation", { method: "GET" }),
  addHolding: (data) =>
    fetchWithAuth("/portfolio/holdings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkAddHoldings: (data) =>
    fetchWithAuth("/portfolio/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateHolding: (id, data) =>
    fetchWithAuth(`/portfolio/holdings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteHolding: (id) =>
    fetchWithAuth(`/portfolio/holdings/${id}`, { method: "DELETE" }),

  // --- Watchlist ---
  getWatchlist: () => fetchWithAuth("/watchlist", { method: "GET" }),
  addToWatchlist: (data) =>
    fetchWithAuth("/watchlist", { method: "POST", body: JSON.stringify(data) }),
  removeFromWatchlist: (id) =>
    fetchWithAuth(`/watchlist/${id}`, { method: "DELETE" }),

  // --- Broker Integration ---
  syncAngelOne: () =>
    fetchWithAuth("/broker/sync/angelone", { method: "POST" }),
  syncZerodha: (requestToken) =>
    fetchWithAuth("/broker/sync/zerodha", { 
      method: "POST", 
      body: JSON.stringify({ requestToken }) 
    }),
  syncUpstox: (authCode) =>
    fetchWithAuth("/broker/sync/upstox", { 
      method: "POST", 
      body: JSON.stringify({ authCode }) 
    }),
  syncGroww: (accessToken) =>
    fetchWithAuth("/broker/sync/groww", { 
      method: "POST", 
      body: JSON.stringify({ accessToken }) 
    }),
  getBrokerConnections: () =>
    fetchWithAuth("/broker/connections", { method: "GET" }),
  disconnectBroker: (source) =>
    fetchWithAuth(`/broker/disconnect/${source}`, { method: "DELETE" }),

  // --- Market Data & AI ---
  getMarketIndices: () => fetchWithAuth("/market/indices", { method: "GET" }),
  searchStocks: (query) => fetchWithAuth(`/market/search?q=${encodeURIComponent(query)}`, { method: "GET" }),
  getQuote: (symbol) => fetchWithAuth(`/market/quote?symbol=${encodeURIComponent(symbol)}`, { method: "GET" }),
  getShareholding: (symbol) => fetchWithAuth(`/market/shareholding?symbol=${encodeURIComponent(symbol)}`, { method: "GET" }),
  getHistory: (symbol, interval = '1day') => fetchWithAuth(`/market/history?symbol=${encodeURIComponent(symbol)}&interval=${interval}`, { method: "GET" }),
  getGrowwData: (symbol) => fetchWithAuth(`/market/groww/${encodeURIComponent(symbol)}`, { method: "GET" }),
  generateAiInsights: (data) =>
    fetchWithAuth("/ai/insights", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAiSignal: (symbol) => 
    fetchWithAuth(`/ai/signal/${encodeURIComponent(symbol)}`, { method: "GET" }),
  getSavedSignals: () =>
    fetchWithAuth("/ai/signals", { method: "GET" }),
  orchestrateMlStrategy: (symbol) =>
    fetchWithAuth(`/ai/orchestrate/${encodeURIComponent(symbol)}`, { method: "GET" }),
};

