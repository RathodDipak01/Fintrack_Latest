/**
 * Utility to map stock symbols to their respective industry sectors.
 * This is used to provide sector-wise diversification analysis for Indian portfolios.
 */

const SECTOR_MAP = {
  // IT & Software
  TCS: "IT",
  INFY: "IT",
  WIPRO: "IT",
  HCLTECH: "IT",
  LTIM: "IT",
  TECHM: "IT",
  KPITTECH: "IT",
  TATAELXSI: "IT",
  SAKSOFT: "IT",
  PERSISTENT: "IT",
  SONATSOFTW: "IT",
  COFORGE: "IT",

  // Banking & Financials
  HDFCBANK: "Banking",
  ICICIBANK: "Banking",
  SBIN: "Banking",
  KOTAKBANK: "Banking",
  AXISBANK: "Banking",
  INDUSINDBK: "Banking",
  PNB: "Banking",
  CANBK: "Banking",
  YESBANK: "Banking",
  FEDERALBNK: "Banking",
  IDFCFIRSTB: "Banking",
  BAJFINANCE: "Financial Services",
  BAJAJFINSV: "Financial Services",
  RELIANCE: "Conglomerate/Energy",
  MUTHOOTFIN: "Financial Services",
  CHOLAFIN: "Financial Services",

  // Energy & Power
  ADANIPOWER: "Energy",
  ADANIGREEN: "Energy",
  ADANITRANS: "Energy",
  NTPC: "Energy",
  POWERGRID: "Energy",
  ONGC: "Energy",
  BPCL: "Energy",
  IOC: "Energy",
  GAIL: "Energy",
  COALINDIA: "Energy",
  NHPC: "Energy",
  JSWENERGY: "Energy",

  // Pharma & Healthcare
  SUNPHARMA: "Pharma",
  DIVISLAB: "Pharma",
  DRREDDY: "Pharma",
  CIPLA: "Pharma",
  APOLLOHOSP: "Healthcare",
  MAXHEALTH: "Healthcare",
  TORNTPHARM: "Pharma",
  LUPIN: "Pharma",
  AUROPHARMA: "Pharma",
  ALKEM: "Pharma",

  // FMCG & Consumer
  ITC: "FMCG",
  HINDUNILVR: "FMCG",
  NESTLEIND: "FMCG",
  BRITANNIA: "FMCG",
  VBL: "FMCG",
  TATACONSUM: "FMCG",
  MARICO: "FMCG",
  DABUR: "FMCG",
  GODREJCP: "FMCG",
  COLPAL: "FMCG",

  // Auto
  MARUTI: "Auto",
  TATAMOTORS: "Auto",
  "M&M": "Auto",
  EICHERMOT: "Auto",
  BAJAJ_AUTO: "Auto",
  HEROMOTOCO: "Auto",
  TVSMOTOR: "Auto",
  ASHOKLEY: "Auto",

  // Metal & Mining
  TATASTEEL: "Metals",
  JINDALSTEL: "Metals",
  JSWSTEEL: "Metals",
  HINDALCO: "Metals",
  VEDL: "Metals",
  NMDC: "Metals",

  // Telecom & Infra
  BHARTIARTL: "Telecom",
  IDEA: "Telecom",
  INDUSTOWER: "Telecom",
  LT: "EPC/Infra",
  IRB: "Infra",
  ADANIENT: "Conglomerate",
  
  // Real Estate
  DLF: "Real Estate",
  GODREJPROP: "Real Estate",
  OBEROIRLTY: "Real Estate",
  LODHA: "Real Estate",
  PHOENIXLTD: "Real Estate",

  // Logistics & Paints
  ASIANPAINT: "Paints",
  BERGEPAINT: "Paints",
  KANSAINER: "Paints",
  CONCOR: "Logistics",
  DELHIVERY: "Logistics",
  BLUEDART: "Logistics"
};

/**
 * Returns the sector for a given symbol.
 * Defaults to 'Other' if symbol is not mapped.
 */
export function getSector(symbol) {
  if (!symbol) return "Other";
  const upperSymbol = symbol.toUpperCase().split(".")[0]; // Handle NSE/BSE suffix
  return SECTOR_MAP[upperSymbol] || "Other";
}
