import express from "express";
import { z } from "zod";
import { allocation, holdings, portfolioSummary } from "../data/mockData.js";
import { created, error, ok } from "../utils/apiResponse.js";

export const portfolioRouter = express.Router();

const holdingSchema = z.object({
  symbol: z.string().min(1).transform((value) => value.toUpperCase()),
  name: z.string().min(1),
  qty: z.number().positive(),
  avgCost: z.number().positive(),
  currentPrice: z.number().positive(),
  sector: z.string().min(1)
});

portfolioRouter.get("/summary", (req, res) => ok(res, portfolioSummary));
portfolioRouter.get("/holdings", (req, res) => ok(res, holdings));
portfolioRouter.get("/allocation", (req, res) => ok(res, allocation));

portfolioRouter.post("/holdings", (req, res) => {
  const parsed = holdingSchema.safeParse(req.body);
  if (!parsed.success) return error(res, 400, "Invalid holding data", parsed.error.flatten());

  const holding = {
    id: `h${holdings.length + 1}`,
    ...parsed.data,
    changePercent: 0,
    pnl: Number(((parsed.data.currentPrice - parsed.data.avgCost) * parsed.data.qty).toFixed(2))
  };
  holdings.push(holding);
  return created(res, holding, "Holding added for analysis");
});

portfolioRouter.patch("/holdings/:id", (req, res) => {
  const holding = holdings.find((item) => item.id === req.params.id);
  if (!holding) return error(res, 404, "Holding not found");

  Object.assign(holding, req.body);
  return ok(res, holding, "Holding updated");
});

portfolioRouter.delete("/holdings/:id", (req, res) => {
  const index = holdings.findIndex((item) => item.id === req.params.id);
  if (index === -1) return error(res, 404, "Holding not found");

  const [removed] = holdings.splice(index, 1);
  return ok(res, removed, "Holding removed");
});
