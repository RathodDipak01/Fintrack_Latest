import express from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { created, error, ok } from "../utils/apiResponse.js";
import { fetchLiveMarketData } from "../services/angelOne.js";

export const watchlistRouter = express.Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get("/", async (req, res) => {
  try {
    const list = await prisma.watchlist.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    const symbols = list.map(item => item.symbol);
    const liveData = await fetchLiveMarketData(symbols);
    
    // Merge live LTS into our watchlist rows
    const enrichedList = list.map(item => {
      const liveObj = liveData.find(l => l.symbol === item.symbol);
      return {
        ...item,
        price: liveObj ? liveObj.ltp : 0,
        changePercent: (Math.random() * 5 - 2).toFixed(2), // placeholder until prevClose logic implies
      };
    });

    return ok(res, enrichedList);
  } catch (err) {
    console.error(err);
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

    const item = await prisma.watchlist.create({
      data: {
        userId: req.userId,
        symbol: parsed.data.symbol,
        alertText: parsed.data.alertText || "No alert configured"
      }
    });

    return created(res, item, "Added to watchlist");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to add to watchlist");
  }
});

watchlistRouter.delete("/:id", async (req, res) => {
  try {
    const rmCount = await prisma.watchlist.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    if (rmCount.count === 0) return error(res, 404, "Watchlist item not found or unauthorized");
    return ok(res, null, "Removed from watchlist");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Failed to delete watchlist item");
  }
});
