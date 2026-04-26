/**
 * Utility to map stock symbols to their respective industry sectors.
 * Updated to use explicit precise sector namings requested by Fintrack premium user.
 */

const SECTOR_MAP = {
  // Software Services
  TCS: "Software Services",
  INFY: "Software Services",
  WIPRO: "Software Services",
  HCLTECH: "Software Services",
  LTIM: "Software Services",
  TECHM: "Software Services",
  KPITTECH: "Software Services",
  TATAELXSI: "Software Services",
  SAKSOFT: "Software Services",
  PERSISTENT: "Software Services",
  SONATSOFTW: "Software Services",
  COFORGE: "Software Services",
  CEINSYS: "Software Services",

  // Financial Services
  HDFCBANK: "Financial Services",
  ICICIBANK: "Financial Services",
  SBIN: "Financial Services",
  KOTAKBANK: "Financial Services",
  AXISBANK: "Financial Services",
  INDUSINDBK: "Financial Services",
  PNB: "Financial Services",
  CANBK: "Financial Services",
  YESBANK: "Financial Services",
  FEDERALBNK: "Financial Services",
  IDFCFIRSTB: "Financial Services",
  BAJFINANCE: "Financial Services",
  BAJAJFINSV: "Financial Services",
  MUTHOOTFIN: "Financial Services",
  CHOLAFIN: "Financial Services",
  CDSL: "Financial Services",

  // Energy
  ADANIPOWER: "Energy",
  ADANIGREEN: "Energy",
  ADANITRANS: "Energy",
  PREMIERENE: "Energy",
  NTPC: "Energy",
  POWERGRID: "Energy",
  ONGC: "Energy",
  BPCL: "Energy",
  IOC: "Energy",
  GAIL: "Energy",
  COALINDIA: "Energy",
  NHPC: "Energy",
  JSWENERGY: "Energy",
  RELIANCE: "Energy",

  // Healthcare
  SUNPHARMA: "Healthcare",
  DIVISLAB: "Healthcare",
  DRREDDY: "Healthcare",
  CIPLA: "Healthcare",
  APOLLOHOSP: "Healthcare",
  MAXHEALTH: "Healthcare",
  TORNTPHARM: "Healthcare",
  LUPIN: "Healthcare",
  AUROPHARMA: "Healthcare",
  ALKEM: "Healthcare",
  ANUHPHR: "Healthcare",

  // Retail
  ITC: "Retail",
  HINDUNILVR: "Retail",
  NESTLEIND: "Retail",
  BRITANNIA: "Retail",
  VBL: "Retail",
  TATACONSUM: "Retail",
  MARICO: "Retail",
  DABUR: "Retail",
  GODREJCP: "Retail",
  COLPAL: "Retail",

  // Auto Ancillaries
  MARUTI: "Auto Ancillaries",
  TATAMOTORS: "Auto Ancillaries",
  "M&M": "Auto Ancillaries",
  EICHERMOT: "Auto Ancillaries",
  BAJAJ_AUTO: "Auto Ancillaries",
  HEROMOTOCO: "Auto Ancillaries",
  TVSMOTOR: "Auto Ancillaries",
  ASHOKLEY: "Auto Ancillaries",
  BANCOINDIA: "Auto Ancillaries",
  FIEMIND: "Auto Ancillaries",

  // Engineering
  TATASTEEL: "Engineering",
  JINDALSTEL: "Engineering",
  JSWSTEEL: "Engineering",
  HINDALCO: "Engineering",
  VEDL: "Engineering",
  NMDC: "Engineering",
  LT: "Engineering",
  IRB: "Engineering",
  EIEL: "Engineering",
  QPOWER: "Engineering",

  // Industrial Conglomerate
  ADANIENT: "Industrial Conglomerate",
  RELIANCE: "Industrial Conglomerate",

  // Telecom
  BHARTIARTL: "Telecom",
  IDEA: "Telecom",
  INDUSTOWER: "Telecom",

  // Real Estate
  DLF: "Real Estate",
  GODREJPROP: "Real Estate",
  OBEROIRLTY: "Real Estate",
  LODHA: "Real Estate",
  PHOENIXLTD: "Real Estate",
  ANANTRAJ: "Real Estate",

  // Fertilizers & Chemicals
  FACT: "Fertilizers",
  CHAMBALFERT: "Fertilizers",
  RCF: "Fertilizers",
  COROMANDEL: "Fertilizers",
  TATACHEM: "Chemicals",
  UPL: "Chemicals",

  // Logistics
  CONCOR: "Logistics",
  DELHIVERY: "Logistics",
  BLUEDART: "Logistics",
  
  // Consumer Durables
  TITAN: "Consumer Durables",
  VOLTAS: "Consumer Durables",
  HAVELLS: "Consumer Durables",
  
  // Paints
  ASIANPAINT: "Paints & Wall Decor",
  BERGEPAINT: "Paints & Wall Decor",
  KANSAINER: "Paints & Wall Decor"
};

/**
 * Returns the sector for a given symbol.
 * Smart fallbacks added to eliminate 'Other'.
 */
export function getSector(symbol) {
  if (!symbol) return "Financial Services"; 
  const upperSymbol = symbol.toUpperCase().split(".")[0].split("-")[0];
  
  if (SECTOR_MAP[upperSymbol]) {
    return SECTOR_MAP[upperSymbol];
  }

  // Fallback heuristics to eliminate generic categories
  if (upperSymbol.includes("BANK") || upperSymbol.includes("FIN")) return "Financial Services";
  if (upperSymbol.includes("TECH") || upperSymbol.includes("SOFT")) return "Software Services";
  if (upperSymbol.includes("PHARMA") || upperSymbol.includes("LAB")) return "Healthcare";
  if (upperSymbol.includes("AUTO") || upperSymbol.includes("MOT")) return "Auto & Components";
  if (upperSymbol.includes("STEEL") || upperSymbol.includes("IND")) return "Industrial Conglomerate";
  if (upperSymbol.includes("POWER") || upperSymbol.includes("ENE")) return "Energy & Renewables";
  if (upperSymbol.includes("ADANI")) return "Industrial Conglomerate";
  
  // Absolute fallback defaults to "Diversified" to avoid "Trading" or "Other"
  return "Diversified"; 
}
