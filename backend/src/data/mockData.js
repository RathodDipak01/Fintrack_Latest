export const users = [
  {
    id: "user_001",
    name: "Deepak",
    email: "deepak@fintrack.app",
    password: "mockpass",
    riskProfile: "Moderate"
  }
];

export const portfolioSummary = {
  totalInvestment: 4850000,
  currentValue: 5980000,
  totalReturns: 1130000,
  todayChange: 135000,
  todayChangePercent: 2.45,
  riskScore: 62,
  diversification: "IT-heavy with telecom and banking offsets"
};

export const holdings = [
  { id: "h1", symbol: "ADANIPOWER", name: "Adani Power Ltd", qty: 30, avgCost: 193.68, currentPrice: 248.95, changePercent: 4.2, pnl: 16581, sector: "Energy" },
  { id: "h2", symbol: "TCS", name: "Tata Consultancy", qty: 18, avgCost: 3412, currentPrice: 3684, changePercent: 2.4, pnl: 48960, sector: "IT" },
  { id: "h3", symbol: "HDFCBANK", name: "HDFC Bank", qty: 42, avgCost: 1476, currentPrice: 1526, changePercent: 1.1, pnl: 21000, sector: "Banking" },
  { id: "h4", symbol: "INFY", name: "Infosys", qty: 36, avgCost: 1410, currentPrice: 1368, changePercent: -1.8, pnl: -15120, sector: "IT" },
  { id: "h5", symbol: "SUNPHARMA", name: "Sun Pharma", qty: 22, avgCost: 1146, currentPrice: 1228, changePercent: 3.2, pnl: 18040, sector: "Pharma" },
  { id: "h6", symbol: "RELIANCE", name: "Reliance Industries", qty: 15, avgCost: 2514, currentPrice: 2592, changePercent: 0.7, pnl: 11700, sector: "Energy" },
  { id: "h7", symbol: "WIPRO", name: "Wipro Ltd", qty: 50, avgCost: 245.2, currentPrice: 268.4, changePercent: 9.4, pnl: 11610, sector: "IT" },
  { id: "h8", symbol: "ITC", name: "ITC Ltd", qty: 100, avgCost: 412, currentPrice: 438.25, changePercent: 6.3, pnl: 26250, sector: "FMCG" },
  { id: "h9", symbol: "SBIN", name: "State Bank of India", qty: 80, avgCost: 720.5, currentPrice: 758.3, changePercent: 5.3, pnl: 30224, sector: "Banking" },
  { id: "h10", symbol: "BHARTIARTL", name: "Bharti Airtel", qty: 25, avgCost: 1180, currentPrice: 1245.6, changePercent: 5.5, pnl: 16390, sector: "Telecom" },
  { id: "h11", symbol: "MARUTI", name: "Maruti Suzuki", qty: 6, avgCost: 11200, currentPrice: 11842, changePercent: 1.2, pnl: 3852, sector: "Auto" },
  { id: "h12", symbol: "DIVISLAB", name: "Divi's Laboratories", qty: 14, avgCost: 3650, currentPrice: 3892, changePercent: 2.9, pnl: 3388, sector: "Pharma" }
];

export const allocation = [
  { sector: "IT", value: 32 },
  { sector: "Banking", value: 24 },
  { sector: "Pharma", value: 14 },
  { sector: "Energy", value: 12 },
  { sector: "FMCG", value: 9 },
  { sector: "Telecom", value: 6 },
  { sector: "Auto", value: 3 }
];

export const watchlist = [
  { id: "w1", symbol: "ADANIPOWER", price: 248.95, changePercent: 4.2, alert: "Momentum alert active" },
  { id: "w2", symbol: "TCS", price: 3684.2, changePercent: 2.4, alert: "AI accumulation zone" },
  { id: "w3", symbol: "INFY", price: 1368, changePercent: -1.8, alert: "Support breach" },
  { id: "w4", symbol: "HDFCBANK", price: 1526.4, changePercent: 1.1, alert: "Near 52-week high" },
  { id: "w5", symbol: "WIPRO", price: 268.4, changePercent: 9.4, alert: "Breakout watch" },
  { id: "w6", symbol: "SBIN", price: 758.3, changePercent: 5.3, alert: "Dividend window" },
  { id: "w7", symbol: "BHARTIARTL", price: 1245.6, changePercent: 5.5, alert: "ARPU tracking" },
  { id: "w8", symbol: "ITC", price: 438.25, changePercent: 6.3, alert: "Hotel segment catalyst" }
];

export const alerts = [
  { id: "a1", title: "Adani Power crossed 28% three-month momentum", type: "Opportunity", status: "Active", severity: "positive" },
  { id: "a2", title: "IT exposure crossed 35%", type: "Risk increase", status: "Active", severity: "warning" },
  { id: "a3", title: "Infosys fell below support", type: "Price drop", status: "Triggered", severity: "negative" },
  { id: "a4", title: "Banking momentum strengthening", type: "Opportunity", status: "Active", severity: "positive" },
  { id: "a5", title: "Wipro broke above 200-DMA", type: "Opportunity", status: "Active", severity: "positive" },
  { id: "a6", title: "SBI dividend record date in 5 sessions", type: "Corporate action", status: "Active", severity: "positive" },
  { id: "a7", title: "Airtel ARPU revision chatter", type: "Watch", status: "Active", severity: "warning" },
  { id: "a8", title: "Maruti exports data due this week", type: "Event", status: "Snoozed", severity: "warning" }
];

export const suggestions = [
  { id: "s1", type: "POSITIVE", symbol: "ADANIPOWER", date: "16 Apr 2026", confidence: 90, trigger: "Demand outlook", outcome: "+4.2%", explanation: "Power demand outlook and shareholder stability support the current stance." },
  { id: "s2", type: "WATCH", symbol: "TCS", date: "12 Apr 2026", confidence: 84, trigger: "Earnings momentum", outcome: "+2.4%", explanation: "Momentum remains strong, but IT exposure is already high." },
  { id: "s3", type: "RISK ALERT", symbol: "INFY", date: "09 Apr 2026", confidence: 71, trigger: "Support breach", outcome: "-1.8%", explanation: "Short-term volatility is above the portfolio average." },
  { id: "s4", type: "POSITIVE", symbol: "WIPRO", date: "08 Apr 2026", confidence: 76, trigger: "Margin recovery", outcome: "+9.4%", explanation: "Deal wins and cost actions are improving operating metrics." },
  { id: "s5", type: "WATCH", symbol: "BHARTIARTL", date: "05 Apr 2026", confidence: 68, trigger: "ARPU revision", outcome: "+5.5%", explanation: "Regulatory headlines can move the name faster than fundamentals." },
  { id: "s6", type: "POSITIVE", symbol: "SBIN", date: "02 Apr 2026", confidence: 73, trigger: "Credit growth", outcome: "+5.3%", explanation: "Loan growth and margin trajectory remain supportive." },
  { id: "s7", type: "WATCH", symbol: "MARUTI", date: "28 Mar 2026", confidence: 65, trigger: "Export mix", outcome: "+1.2%", explanation: "Domestic PV cycle is improving but not yet broad-based." },
  { id: "s8", type: "RISK ALERT", symbol: "DIVISLAB", date: "22 Mar 2026", confidence: 62, trigger: "FDA inspection", outcome: "-0.6%", explanation: "Regulatory overhang until inspection closure is confirmed." },
  { id: "s9", type: "POSITIVE", symbol: "ITC", date: "18 Mar 2026", confidence: 74, trigger: "FMCG volume", outcome: "+6.3%", explanation: "Cigarette pricing and hotels are both contributing to sentiment." }
];

export const stockDetails = {
  ADANIPOWER: {
    symbol: "ADANIPOWER",
    name: "Adani Power Ltd",
    price: 248.95,
    changePercent: 4.2,
    analystStance: "POSITIVE",
    confidence: 90,
    companyInfo: {
      organization: "Adani Power Ltd",
      headquarters: "Ahmedabad, Gujarat",
      industry: "Power Generation & Distribution"
    },
    insights: [
      "In the last 3 months, ADANIPOWER moved up by 28.6%.",
      "Mutual fund holdings increased from 3.18% to 3.62% in Mar 2026.",
      "Delivery volumes are elevated, confirming stronger participation."
    ],
    shareholding: [
      { investor: "Promoter Holdings", holdings: "74.96%" },
      { investor: "Foreign Institutions", holdings: "11.74%" },
      { investor: "Mutual Funds", holdings: "3.62%" },
      { investor: "Retail Investors", holdings: "9.62%" },
      { investor: "Others", holdings: "0.07%" }
    ]
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 3684,
    changePercent: 2.4,
    analystStance: "POSITIVE",
    confidence: 84,
    companyInfo: {
      organization: "Tata Consultancy Services Ltd",
      headquarters: "Mumbai, Maharashtra",
      industry: "IT Services & Consulting"
    },
    insights: [
      "Large-deal momentum and stable margins support premium valuation vs peers.",
      "Attrition has cooled versus prior quarters.",
      "North America growth remains the key swing factor for FY27 estimates."
    ],
    shareholding: [
      { investor: "Promoter / Tata Group", holdings: "72.41%" },
      { investor: "Foreign Institutions", holdings: "12.88%" },
      { investor: "Mutual Funds", holdings: "3.21%" },
      { investor: "Retail & Others", holdings: "11.50%" }
    ]
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1368,
    changePercent: -1.8,
    analystStance: "CAUTION",
    confidence: 71,
    companyInfo: {
      organization: "Infosys Ltd",
      headquarters: "Bengaluru, Karnataka",
      industry: "IT Services & Consulting"
    },
    insights: [
      "Near-term deal timing noise has weighed on relative performance.",
      "Margin band is intact; cost discipline remains a focus.",
      "BFSI vertical mix is a monitorable for the next two quarters."
    ],
    shareholding: [
      { investor: "Promoter Holdings", holdings: "14.78%" },
      { investor: "Foreign Institutions", holdings: "33.42%" },
      { investor: "Mutual Funds", holdings: "15.06%" },
      { investor: "Retail & Others", holdings: "36.74%" }
    ]
  },
  WIPRO: {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    price: 268.4,
    changePercent: 9.4,
    analystStance: "POSITIVE",
    confidence: 76,
    companyInfo: {
      organization: "Wipro Ltd",
      headquarters: "Bengaluru, Karnataka",
      industry: "IT Services & Consulting"
    },
    insights: [
      "Operating metrics are improving after a multi-quarter reset.",
      "Client mining in top accounts is showing early green shoots.",
      "Valuation still discounts a slower growth profile vs tier-1 peers."
    ],
    shareholding: [
      { investor: "Promoter Holdings", holdings: "72.34%" },
      { investor: "Foreign Institutions", holdings: "9.12%" },
      { investor: "Mutual Funds", holdings: "8.45%" },
      { investor: "Retail & Others", holdings: "10.09%" }
    ]
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 758.3,
    changePercent: 5.3,
    analystStance: "POSITIVE",
    confidence: 73,
    companyInfo: {
      organization: "State Bank of India",
      headquarters: "Mumbai, Maharashtra",
      industry: "Banking"
    },
    insights: [
      "Loan growth is tracking ahead of system averages in retail and SME.",
      "Asset quality buffers remain adequate under stress scenarios.",
      "Treasury yields influence near-term OCI volatility."
    ],
    shareholding: [
      { investor: "Government of India", holdings: "57.49%" },
      { investor: "Foreign Institutions", holdings: "11.22%" },
      { investor: "Mutual Funds", holdings: "9.88%" },
      { investor: "Retail & Others", holdings: "21.41%" }
    ]
  }
};
