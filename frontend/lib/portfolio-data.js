export const performanceData = [
  { day: "Mon", portfolio: 108.2, nifty: 108.4, forecast: null },
  { day: "Tue", portfolio: 109.5, nifty: 109.1, forecast: null },
  { day: "Wed", portfolio: 110.8, nifty: 109.6, forecast: null },
  { day: "Thu", portfolio: 111.6, nifty: 110.2, forecast: null },
  { day: "Fri", portfolio: 112.4, nifty: 110.2, forecast: null },
  { day: "Mon+1", portfolio: 114.1, nifty: 110.9, forecast: null },
  { day: "Tue+1", portfolio: 113.2, nifty: 111.4, forecast: null },
  { day: "Wed+1", portfolio: 116.8, nifty: 112.1, forecast: null },
  { day: "Thu+1", portfolio: 118.2, nifty: 112.8, forecast: null },
  { day: "Fri+1", portfolio: 119.6, nifty: 113.3, forecast: null },
  { day: "Next", portfolio: null, nifty: null, forecast: 121.4 },
  { day: "Next+2", portfolio: null, nifty: null, forecast: 123.1 },
  { day: "Next+4", portfolio: null, nifty: null, forecast: 124.8 },
];

export const allocationData = [
  { name: "IT", value: 32, color: "#3B82F6" },
  { name: "Banking", value: 24, color: "#22C55E" },
  { name: "Pharma", value: 14, color: "#FACC15" },
  { name: "Energy", value: 12, color: "#EF4444" },
  { name: "FMCG", value: 9, color: "#A3E635" },
  { name: "Telecom", value: 6, color: "#E879F9" },
  { name: "Auto", value: 3, color: "#38BDF8" },
];

export const holdings = [
  {
    symbol: "ADANIPOWER",
    name: "Adani Power Ltd",
    qty: 30,
    avg: "193.68",
    price: "248.95",
    change: 4.2,
    pnl: "16,581",
    sector: "Energy",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy",
    qty: 18,
    avg: "3,412",
    price: "3,684",
    change: 2.4,
    pnl: "48,960",
    sector: "IT",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    qty: 42,
    avg: "1,476",
    price: "1,526",
    change: 1.1,
    pnl: "21,000",
    sector: "Banking",
  },
  {
    symbol: "INFY",
    name: "Infosys",
    qty: 36,
    avg: "1,410",
    price: "1,368",
    change: -1.8,
    pnl: "-15,120",
    sector: "IT",
  },
  {
    symbol: "SUNPHARMA",
    name: "Sun Pharma",
    qty: 22,
    avg: "1,146",
    price: "1,228",
    change: 3.2,
    pnl: "18,040",
    sector: "Pharma",
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    qty: 15,
    avg: "2,514",
    price: "2,592",
    change: 0.7,
    pnl: "11,700",
    sector: "Energy",
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd",
    qty: 50,
    avg: "245.20",
    price: "268.40",
    change: 9.4,
    pnl: "11,610",
    sector: "IT",
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    qty: 100,
    avg: "412.00",
    price: "438.25",
    change: 6.3,
    pnl: "26,250",
    sector: "FMCG",
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    qty: 80,
    avg: "720.50",
    price: "758.30",
    change: 5.3,
    pnl: "30,224",
    sector: "Banking",
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel",
    qty: 25,
    avg: "1,180.00",
    price: "1,245.60",
    change: 5.5,
    pnl: "16,390",
    sector: "Telecom",
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki",
    qty: 6,
    avg: "11,200",
    price: "11,842",
    change: 1.2,
    pnl: "3,852",
    sector: "Auto",
  },
  {
    symbol: "DIVISLAB",
    name: "Divi's Laboratories",
    qty: 14,
    avg: "3,650",
    price: "3,892",
    change: 2.9,
    pnl: "3,388",
    sector: "Pharma",
  },
];

export const stockSignals = [
  {
    symbol: "ADANIPOWER",
    signal: "Bullish",
    confidence: 90,
    note: "Demand outlook, analyst rating and shareholder stability support near-term strength.",
  },
  {
    symbol: "TCS",
    signal: "Bullish",
    confidence: 84,
    note: "Earnings quality and momentum remain strong.",
  },
  {
    symbol: "INFY",
    signal: "Bearish",
    confidence: 71,
    note: "Short-term volatility is above portfolio average.",
  },
  {
    symbol: "HDFCBANK",
    signal: "Bullish",
    confidence: 78,
    note: "Volume accumulation improved over 5 sessions.",
  },
  {
    symbol: "WIPRO",
    signal: "Bullish",
    confidence: 76,
    note: "Margin recovery narrative gaining traction with clients.",
  },
  {
    symbol: "SBIN",
    signal: "Bullish",
    confidence: 73,
    note: "Credit growth and treasury yields supportive for spreads.",
  },
  {
    symbol: "BHARTIARTL",
    signal: "Neutral",
    confidence: 68,
    note: "ARPU upside priced in; watch regulatory headlines.",
  },
  {
    symbol: "MARUTI",
    signal: "Neutral",
    confidence: 65,
    note: "Volume recovery gradual; exports buffer weak spot.",
  },
];

export const alerts = [
  {
    title: "Adani Power crossed 28% three-month momentum",
    type: "Opportunity",
    status: "Active",
    tone: "profit",
  },
  {
    title: "IT exposure crossed 35%",
    type: "Risk increase",
    status: "Active",
    tone: "warn",
  },
  {
    title: "Infosys fell below support",
    type: "Price drop",
    status: "Triggered",
    tone: "loss",
  },
  {
    title: "Banking momentum strengthening",
    type: "Opportunity",
    status: "Active",
    tone: "profit",
  },
  {
    title: "Wipro broke above 200-DMA",
    type: "Opportunity",
    status: "Active",
    tone: "profit",
  },
  {
    title: "SBI dividend record date in 5 sessions",
    type: "Corporate action",
    status: "Active",
    tone: "ai",
  },
  {
    title: "Airtel ARPU revision chatter",
    type: "Watch",
    status: "Active",
    tone: "warn",
  },
  {
    title: "Maruti exports data due this week",
    type: "Event",
    status: "Snoozed",
    tone: "ai",
  },
];

export const candles = [
  { time: "09:15", open: 3632, high: 3654, low: 3618, close: 3646 },
  { time: "09:45", open: 3646, high: 3660, low: 3638, close: 3652 },
  { time: "10:15", open: 3646, high: 3672, low: 3642, close: 3668 },
  { time: "10:45", open: 3668, high: 3680, low: 3654, close: 3674 },
  { time: "11:15", open: 3668, high: 3688, low: 3656, close: 3678 },
  { time: "11:45", open: 3678, high: 3690, low: 3668, close: 3682 },
  { time: "12:15", open: 3678, high: 3692, low: 3662, close: 3666 },
  { time: "12:45", open: 3666, high: 3684, low: 3658, close: 3672 },
  { time: "13:15", open: 3666, high: 3696, low: 3658, close: 3684 },
  { time: "13:45", open: 3684, high: 3702, low: 3676, close: 3696 },
  { time: "14:15", open: 3696, high: 3708, low: 3688, close: 3701 },
  { time: "15:15", open: 3701, high: 3712, low: 3692, close: 3704 },
];

export const livePriceSeries = [
  { time: "09:15", price: 239.2 },
  { time: "09:30", price: 240.1 },
  { time: "09:45", price: 241.6 },
  { time: "10:00", price: 241.0 },
  { time: "10:15", price: 240.4 },
  { time: "10:30", price: 242.8 },
  { time: "10:45", price: 244.1 },
  { time: "11:00", price: 243.2 },
  { time: "11:15", price: 243.7 },
  { time: "11:30", price: 245.0 },
  { time: "11:45", price: 247.2 },
  { time: "12:00", price: 246.4 },
  { time: "12:15", price: 246.1 },
  { time: "12:30", price: 247.9 },
  { time: "12:45", price: 249.0 },
  { time: "13:00", price: 248.3 },
  { time: "13:15", price: 250.1 },
];

/** Same session timeline as `livePriceSeries`, OHLC in the same ₹ band for a combined price + technical chart. */
export const stockIntradayMerged = livePriceSeries.map((p, i) => {
  const w = Math.max(0.35, p.price * 0.008);
  const open = p.price - w * (((i % 4) - 1.5) * 0.35);
  const close = p.price + w * ((((i + 2) % 5) - 2) * 0.32);
  const high = Math.max(open, close) + w * 0.5;
  const low = Math.min(open, close) - w * 0.45;
  return { time: p.time, price: p.price, open, high, low, close };
});

export const companyInsights = [
  {
    tag: "Positive impact",
    title: "Price Rise",
    text: "In the last 3 months, ADANIPOWER stock has moved up by 28.6%.",
  },
  {
    tag: "Positive impact",
    title: "MF Holdings",
    text: "Mutual fund holdings increased from 3.18% to 3.62% in Mar 2026.",
  },
  {
    tag: "Watch closely",
    title: "Volume Spike",
    text: "Delivery volumes are elevated, confirming stronger participation.",
  },
  {
    tag: "Neutral",
    title: "Peer comparison",
    text: "Sector peers are up 12% on average over the same period; ADANIPOWER is ahead of the pack.",
  },
  {
    tag: "Watch closely",
    title: "FII activity",
    text: "Foreign institutional stake is stable QoQ with incremental buying in March.",
  },
];

export const analystRatings = [
  { label: "POSITIVE", value: 100, count: 7, color: "#22C55E" },
  { label: "NEUTRAL", value: 0, count: 0, color: "#64748B" },
  { label: "CAUTION", value: 0, count: 0, color: "#EF4444" },
];

export const shareholdingPatterns = [
  {
    investor: "Promoter Holdings",
    values: ["74.96%", "74.96%", "74.96%", "74.96%", "74.96%", "74.96%"],
  },
  {
    investor: "Foreign Institutions",
    values: ["11.74%", "11.50%", "12.10%", "12.50%", "13.20%", "14.50%"],
  },
  {
    investor: "Mutual Funds",
    values: ["3.62%", "3.20%", "2.90%", "2.40%", "2.10%", "1.80%"],
  },
  {
    investor: "Retail Investors",
    values: ["9.62%", "10.20%", "9.80%", "9.90%", "9.40%", "8.50%"],
  },
  {
    investor: "Others",
    values: ["0.06%", "0.14%", "0.24%", "0.24%", "0.34%", "0.24%"],
  },
];

export const sentimentDetails = [
  { label: "Bullish", value: 12 },
  { label: "Neutral", value: 3 },
  { label: "Bearish", value: 1 },
];

export const keyEvents = [
  {
    title:
      "Adani Power Shares Rise Amid Positive Demand Outlook - 16 Apr, 2026",
    text: "Adani Power shares increased by over 2% as investor confidence grew due to forecasts of rising power demand this summer.",
  },
  {
    title: "Power Demand Sentiment Turns Constructive",
    text: "Analysts expect peak demand and operating leverage to benefit power generators over the coming quarter.",
  },
  {
    title: "Renewable tie-ups in focus for thermal majors",
    text: "Investors are tracking disclosures on renewable capacity additions and fuel cost pass-through mechanisms.",
  },
  {
    title: "Grid stability investments in summer outlook notes",
    text: "Brokerages highlighted transmission upgrades as a tailwind for integrated power names.",
  },
];

export const watchlist = [
  {
    symbol: "ADANIPOWER",
    price: "₹248.95",
    change: "+4.2%",
    alert: "Momentum alert active",
  },
  {
    symbol: "TCS",
    price: "₹3,684.20",
    change: "+2.4%",
    alert: "AI accumulation zone",
  },
  {
    symbol: "INFY",
    price: "₹1,368.00",
    change: "-1.8%",
    alert: "Support breach",
  },
  {
    symbol: "HDFCBANK",
    price: "₹1,526.40",
    change: "+1.1%",
    alert: "Near 52-week high",
  },
  {
    symbol: "WIPRO",
    price: "₹268.40",
    change: "+9.4%",
    alert: "Breakout watch",
  },
  {
    symbol: "SBIN",
    price: "₹758.30",
    change: "+5.3%",
    alert: "Dividend window",
  },
  {
    symbol: "BHARTIARTL",
    price: "₹1,245.60",
    change: "+5.5%",
    alert: "ARPU tracking",
  },
  {
    symbol: "ITC",
    price: "₹438.25",
    change: "+6.3%",
    alert: "Hotel segment catalyst",
  },
];

export const suggestionHistory = [
  {
    type: "POSITIVE",
    symbol: "ADANIPOWER",
    date: "16 Apr 2026",
    confidence: "90%",
    trigger: "Demand outlook",
    outcome: "+4.2%",
  },
  {
    type: "WATCH",
    symbol: "TCS",
    date: "12 Apr 2026",
    confidence: "84%",
    trigger: "Earnings momentum",
    outcome: "+2.4%",
  },
  {
    type: "RISK ALERT",
    symbol: "INFY",
    date: "09 Apr 2026",
    confidence: "71%",
    trigger: "Support breach",
    outcome: "-1.8%",
  },
  {
    type: "POSITIVE",
    symbol: "WIPRO",
    date: "08 Apr 2026",
    confidence: "76%",
    trigger: "Margin recovery",
    outcome: "+9.4%",
  },
  {
    type: "WATCH",
    symbol: "BHARTIARTL",
    date: "05 Apr 2026",
    confidence: "68%",
    trigger: "ARPU revision",
    outcome: "+5.5%",
  },
  {
    type: "POSITIVE",
    symbol: "SBIN",
    date: "02 Apr 2026",
    confidence: "73%",
    trigger: "Credit growth",
    outcome: "+5.3%",
  },
  {
    type: "WATCH",
    symbol: "MARUTI",
    date: "28 Mar 2026",
    confidence: "65%",
    trigger: "Export mix",
    outcome: "+1.2%",
  },
  {
    type: "RISK ALERT",
    symbol: "DIVISLAB",
    date: "22 Mar 2026",
    confidence: "62%",
    trigger: "FDA inspection",
    outcome: "-0.6%",
  },
  {
    type: "POSITIVE",
    symbol: "ITC",
    date: "18 Mar 2026",
    confidence: "74%",
    trigger: "FMCG volume",
    outcome: "+6.3%",
  },
];

/** Stock detail page — ADANIPOWER sample technicals (decision-support mock, not live data). */
export const stockTechnicalsDetail = {
  symbol: "ADANIPOWER",
  summary:
    "Price is above the 50- and 200-day averages with RSI in a neutral-to-bullish band. Volume confirms participation; watch resistance near the recent swing high.",
  metrics: [
    { label: "RSI (14)", value: "62.4", note: "Neutral–bullish" },
    { label: "MACD", value: "+2.18", note: "Above signal line" },
    { label: "50 DMA", value: "₹221.30", note: "Price above" },
    { label: "200 DMA", value: "₹198.60", note: "Price above" },
    { label: "Support", value: "₹232 / ₹218", note: "Cluster" },
    { label: "Resistance", value: "₹255 / ₹268", note: "Next hurdles" },
    { label: "Volume vs 20D avg", value: "1.42×", note: "Above average" },
    { label: "ATR (14)", value: "₹8.40", note: "Intraday range" },
    { label: "ADX (14)", value: "28", note: "Trend strength moderate" },
    { label: "%K / %D (stoch)", value: "71 / 64", note: "Not overbought" },
  ],
};

/** Stock detail page — ADANIPOWER sample fundamentals (TTM / last reported mock). */
export const stockFundamentalsDetail = {
  symbol: "ADANIPOWER",
  asOf: "FY25 / Mar 2026",
  groups: [
    {
      title: "Valuation",
      rows: [
        { label: "P/E (TTM)", value: "12.4×" },
        { label: "P/B", value: "2.1×" },
        { label: "EV / EBITDA", value: "8.6×" },
        { label: "Mkt cap", value: "₹96,200 Cr" },
      ],
    },
    {
      title: "Earnings & profitability",
      rows: [
        { label: "EPS (TTM)", value: "₹20.05" },
        { label: "PAT margin", value: "14.2%" },
        { label: "ROE", value: "18.6%" },
        { label: "ROCE", value: "15.1%" },
      ],
    },
    {
      title: "Growth (YoY)",
      rows: [
        { label: "Revenue growth", value: "+12.4%" },
        { label: "PAT growth", value: "+21.0%" },
        { label: "EBITDA growth", value: "+16.8%" },
      ],
    },
    {
      title: "Balance sheet & returns",
      rows: [
        { label: "Debt / equity", value: "1.12×" },
        { label: "Interest coverage", value: "3.8×" },
        { label: "Dividend yield", value: "0.6%" },
        { label: "Payout ratio", value: "8%" },
      ],
    },
  ],
};

/** Stock detail page — ADANIPOWER sample financials (TTM / last reported mock). */
export const stockFinancialsDetail = {
  symbol: "ADANIPOWER",
  asOf: "FY25 / Mar 2026",
  groups: [
    {
      title: "Income Statement",
      rows: [
        { label: "Revenue", value: "₹50,000 Cr" },
        { label: "EBITDA", value: "₹12,000 Cr" },
        { label: "Net Income", value: "₹6,000 Cr" },
      ],
    },
    {
      title: "Balance Sheet",
      rows: [
        { label: "Total Assets", value: "₹1,20,000 Cr" },
        { label: "Total Liabilities", value: "₹80,000 Cr" },
        { label: "Total Equity", value: "₹40,000 Cr" },
      ],
    },
    {
      title: "Cash Flow",
      rows: [
        { label: "Operating Cash Flow", value: "₹10,500 Cr" },
        { label: "Investing Cash Flow", value: "-₹6,200 Cr" },
        { label: "Financing Cash Flow", value: "-₹3,100 Cr" },
      ],
    },
  ],
};
