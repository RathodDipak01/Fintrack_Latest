import express from "express";
import { generatePortfolioForecast } from "../services/mlService.js";
import { portfolioSummary } from "../data/mockData.js";
import { ok, error } from "../utils/apiResponse.js";

export const mlRouter = express.Router();

mlRouter.get("/forecast", async (req, res) => {
  try {
    const currentValue = portfolioSummary.currentValue;
    const forecastData = await generatePortfolioForecast(currentValue);
    return ok(res, forecastData, "A.I. Neural Network Forecast generated successfully");
  } catch (err) {
    console.error("ML Forecast Error:", err);
    return error(res, 500, "Failed to run forecasting model");
  }
});
