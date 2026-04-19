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

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fintrack_token", token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fintrack_token");
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
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
  login: (data: any) => fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  signup: (data: any) => fetchWithAuth("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  logout: () => fetchWithAuth("/auth/logout", { method: "POST" }),
  getMe: () => fetchWithAuth("/auth/me", { method: "GET" }),

  // --- Portfolio Analysis ---
  getHoldings: () => fetchWithAuth("/portfolio/holdings", { method: "GET" }),
  getSummary: () => fetchWithAuth("/portfolio/summary", { method: "GET" }),
  getAllocation: () => fetchWithAuth("/portfolio/allocation", { method: "GET" }),
  addHolding: (data: any) => fetchWithAuth("/portfolio/holdings", { method: "POST", body: JSON.stringify(data) }),
  bulkAddHoldings: (data: any[]) => fetchWithAuth("/portfolio/bulk", { method: "POST", body: JSON.stringify(data) }),
  updateHolding: (id: string, data: any) => fetchWithAuth(`/portfolio/holdings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteHolding: (id: string) => fetchWithAuth(`/portfolio/holdings/${id}`, { method: "DELETE" }),

  // --- Watchlist ---
  getWatchlist: () => fetchWithAuth("/watchlist", { method: "GET" }),
  addToWatchlist: (data: any) => fetchWithAuth("/watchlist", { method: "POST", body: JSON.stringify(data) }),
  removeFromWatchlist: (id: string) => fetchWithAuth(`/watchlist/${id}`, { method: "DELETE" }),
};
