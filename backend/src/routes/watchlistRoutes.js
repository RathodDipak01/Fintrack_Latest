import express from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { created, error, ok } from "../utils/apiResponse.js";
import { getStockQuote } from "../services/marketData.js";

export const watchlistRouter = express.Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get("/", async (req, res) => {
  try {
    const list = await prisma.watchlist.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    if (list.length === 0) return ok(res, []);

    // Fetch full quotes for all watchlist items for real-time tracking
    const enrichedList = await Promise.all(
      list.map(async (item) => {
        try {
          // Ensure .NS for Indian stocks if not present
          const sym = item.symbol.includes('.') ? item.symbol : `${item.symbol}.NS`;
          const quote = await getStockQuote(sym).catch(() => null);
          
          return {
            ...item,
            price: quote?.price || 0,
            changePercent: quote?.changePercent || 0,
            name: quote?.name || item.symbol,
            currency: quote?.currency || "INR"
          };
        } catch (e) {
          return { ...item, price: 0, changePercent: 0 };
        }
      })
    );

    return ok(res, enrichedList);
  } catch (err) {
    console.error("Watchlist Fetch Error:", err);
    return error(res, 500, "Failed to load watchlist");
  }
});

watchlistRouter.post("/", async (req, res) => {
  try {
    const parsed = z.object({
      symbol: z.string().min(1).transform((value) => value.toUpperCase()),
      alertText: z.string().optional()
    }).safeParse(req.body);

    if (!parsed.success) return error(res, 400, "Invalid watchlist data", parsed.error.flatten());

    // Prevent duplicates
    const existing = await prisma.watchlist.findFirst({
      where: { userId: req.userId, symbol: parsed.data.symbol }
    });
    if (existing) return error(res, 409, "Stock already in watchlist");

    const item = await prisma.watchlist.create({
      data: {
        userId: req.userId,
        symbol: parsed.data.symbol,
        alertText: parsed.data.alertText || "Tracking..."
      }
    });

    return created(res, item, "Added to watchlist");
  } catch (err) {
    console.error("Watchlist Create Error:", err);
    return error(res, 500, "Failed to add to watchlist");
  }
});

watchlistRouter.delete("/:id", async (req, res) => {
  try {
    const result = await prisma.watchlist.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    if (result.count === 0) return error(res, 404, "Watchlist item not found");
    return ok(res, null, "Removed from watchlist");
  } catch (err) {
    console.error("Watchlist Delete Error:", err);
    return error(res, 500, "Failed to delete watchlist item");
  }
});
