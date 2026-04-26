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
