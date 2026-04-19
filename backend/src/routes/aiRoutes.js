import express from "express";
import { alerts, holdings, portfolioSummary, suggestions } from "../data/mockData.js";
import { generatePortfolioInsights } from "../services/geminiService.js";
import { ok } from "../utils/apiResponse.js";

export const aiRouter = express.Router();

aiRouter.post("/insights", async (req, res) => {
  const result = await generatePortfolioInsights({
    portfolioSummary,
    holdings,
    alerts,
    suggestions,
    userContext: req.body || {}
  });

  return ok(res, result, "AI insights generated");
});
