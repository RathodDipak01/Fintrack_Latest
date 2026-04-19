import express from "express";
import { suggestions } from "../data/mockData.js";
import { ok } from "../utils/apiResponse.js";

export const suggestionRouter = express.Router();

suggestionRouter.get("/", (req, res) => ok(res, suggestions));

suggestionRouter.get("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  return ok(res, suggestions.filter((item) => item.symbol === symbol));
});
