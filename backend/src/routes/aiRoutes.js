import express from "express";
import { alerts, holdings, portfolioSummary, suggestions } from "../data/mockData.js";
import { generatePortfolioInsights } from "../services/geminiService.js";
import { ok } from "../utils/apiResponse.js";

export const aiRouter = express.Router();

aiRouter.post("/insights", async (req, res) => {
  const { holdings: reqHoldings, allocation: reqAllocation, marketCapAllocation: reqMarketCapAllocation, summary: reqSummary, riskAppetite, horizon } = req.body;

  // Ensure we have some data even if body is sparse
  const result = await generatePortfolioInsights({
    portfolioSummary: reqSummary || portfolioSummary,
    holdings: (reqHoldings && reqHoldings.length > 0) ? reqHoldings : holdings,
    allocation: (reqAllocation && reqAllocation.length > 0) ? reqAllocation : [],
    marketCapAllocation: (reqMarketCapAllocation && reqMarketCapAllocation.length > 0) ? reqMarketCapAllocation : [],
    alerts,
    suggestions,
    userContext: { riskAppetite, horizon }
  });

  return ok(res, result, "AI insights generated");
});

aiRouter.get("/market-strategy", async (req, res) => {
  const { fetchTickerNews } = await import("../services/marketData.js");
  const { generateMarketStrategy } = await import("../services/geminiService.js");
  
  // Use Nifty 50 as default for global strategy
  const news = await fetchTickerNews("^NSEI");
  const strategy = await generateMarketStrategy(news);
  
  return ok(res, { strategy }, "Market strategy generated");
});

import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";

aiRouter.get("/signals", requireAuth, async (req, res) => {
  try {
    const signals = await prisma.stockSignal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" }
    });
    return ok(res, signals, "Fetched saved signals");
  } catch (error) {
    console.error("Fetch Signals Error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch signals" });
  }
});

aiRouter.get("/signal/:symbol", requireAuth, async (req, res) => {
  const { symbol } = req.params;
  try {
    const { fetchTickerNews, getStockProfile } = await import("../services/marketData.js");
    const { generateStockSignal } = await import("../services/geminiService.js");
    
    // For NSE stocks, yahoo finance often uses .NS
    const querySymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    
    // 1. Validate symbol (Optional: Yahoo might rate limit)
    const profile = await getStockProfile(querySymbol);
    if (profile === null) {
      console.warn(`Profile not found or rate limited for ${querySymbol}. Proceeding with signal generation anyway.`);
    }

    // 2. Fetch news & generate signal
    const news = await fetchTickerNews(querySymbol);
    const signalData = await generateStockSignal(symbol, news);
    
    // 3. Save to database
    const savedSignal = await prisma.stockSignal.create({
      data: {
        userId: req.userId,
        symbol: signalData.symbol,
        signal: signalData.signal,
        confidence: signalData.confidence,
        note: signalData.note
      }
    });
    
    return ok(res, savedSignal, "Stock signal generated and saved");
  } catch (error) {
    console.error("Signal Generation Error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate stock signal", details: String(error) });
  }
});

aiRouter.get("/orchestrate/:symbol", requireAuth, async (req, res) => {
  const { symbol } = req.params;
  try {
    const { orchestrateMlStrategy } = await import("../services/geminiService.js");
    const result = await orchestrateMlStrategy(symbol);
    return ok(res, result, "ML Strategy orchestrated successfully");
  } catch (error) {
    console.error("Orchestrate Error:", error);
    return res.status(500).json({ success: false, error: "Failed to orchestrate ML strategy", details: String(error) });
  }
});

export default aiRouter;
