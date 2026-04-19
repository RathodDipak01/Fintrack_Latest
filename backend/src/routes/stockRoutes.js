import express from "express";
import { stockDetails, watchlist } from "../data/mockData.js";
import { error, ok } from "../utils/apiResponse.js";

export const stockRouter = express.Router();

stockRouter.get("/search", (req, res) => {
  const query = String(req.query.q || "").toUpperCase();
  const results = watchlist.filter((item) => item.symbol.includes(query));
  return ok(res, results);
});

stockRouter.get("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = stockDetails[symbol];

  if (!stock) return error(res, 404, "Stock details not found in mock data");
  return ok(res, stock);
});
