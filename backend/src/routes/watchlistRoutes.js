import express from "express";
import { z } from "zod";
import { watchlist } from "../data/mockData.js";
import { created, error, ok } from "../utils/apiResponse.js";

export const watchlistRouter = express.Router();

watchlistRouter.get("/", (req, res) => ok(res, watchlist));

watchlistRouter.post("/", (req, res) => {
  const parsed = z.object({
    symbol: z.string().min(1).transform((value) => value.toUpperCase()),
    price: z.number().nonnegative().default(0),
    alert: z.string().optional()
  }).safeParse(req.body);

  if (!parsed.success) return error(res, 400, "Invalid watchlist data", parsed.error.flatten());

  const item = {
    id: `w${watchlist.length + 1}`,
    symbol: parsed.data.symbol,
    price: parsed.data.price,
    changePercent: 0,
    alert: parsed.data.alert || "No alert configured"
  };
  watchlist.push(item);
  return created(res, item, "Added to watchlist");
});

watchlistRouter.delete("/:id", (req, res) => {
  const index = watchlist.findIndex((item) => item.id === req.params.id);
  if (index === -1) return error(res, 404, "Watchlist item not found");

  const [removed] = watchlist.splice(index, 1);
  return ok(res, removed, "Removed from watchlist");
});
