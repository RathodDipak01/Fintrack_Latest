import express from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { created, error, ok } from "../utils/apiResponse.js";
import { getLivePrices } from "../services/marketData.js";

export const alertRouter = express.Router();

alertRouter.use(requireAuth);

alertRouter.get("/", async (req, res) => {
  try {
    // 1. Get user alerts from DB
    const userAlerts = await prisma.alert.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Generate dynamic alerts based on holdings
    const holdings = await prisma.portfolioHolding.findMany({ 
      where: { userId: req.userId } 
    });
    
    // Filter out any holdings with missing symbols
    const validHoldings = holdings.filter(h => h.symbol);
    const symbols = [...new Set(validHoldings.map(h => h.symbol))];
    
    let dynamicAlerts = [];
    if (symbols.length > 0) {
      try {
        const livePrices = await getLivePrices(symbols);

        for (const h of validHoldings) {
          const livePrice = livePrices[h.symbol];
          if (!livePrice || !h.avgCost) continue;

          const change = ((livePrice - h.avgCost) / h.avgCost) * 100;
          
          if (change <= -10) {
            dynamicAlerts.push({
              id: `dyn-${h.id}-loss`,
              type: "Risk increase",
              status: "Triggered",
              title: `${h.symbol} is down ${Math.abs(change).toFixed(1)}% from your buy price.`,
              tone: "loss",
              createdAt: new Date()
            });
          } else if (change >= 20) {
            dynamicAlerts.push({
              id: `dyn-${h.id}-profit`,
              type: "Opportunity",
              status: "Triggered",
              title: `${h.symbol} has surged ${change.toFixed(1)}%. Consider taking profits.`,
              tone: "profit",
              createdAt: new Date()
            });
          }
        }
      } catch (priceErr) {
        console.error("Dynamic alert price fetch failed:", priceErr.message);
        // Continue with just userAlerts if price fetch fails
      }
    }

    // Combine and sort by date
    const allAlerts = [...dynamicAlerts, ...userAlerts].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return ok(res, allAlerts);
  } catch (err) {
    console.error("CRITICAL Alert Fetch Error:", err);
    return error(res, 500, `Failed to fetch alerts: ${err.message}`);
  }
});

alertRouter.post("/", async (req, res) => {
  try {
    const parsed = z.object({
      title: z.string().min(3),
      type: z.string().min(2),
      tone: z.enum(["profit", "loss", "warn", "ai"]).default("ai"),
      symbol: z.string().optional(),
      targetPrice: z.number().optional(),
      condition: z.enum(["above", "below"]).optional()
    }).safeParse(req.body);

    if (!parsed.success) return error(res, 400, "Invalid alert data", parsed.error.flatten());

    const alert = await prisma.alert.create({
      data: {
        ...parsed.data,
        userId: req.userId,
        status: "Active"
      }
    });

    return created(res, alert, "Alert created");
  } catch (err) {
    console.error("Alert Create Error:", err);
    return error(res, 500, "Failed to create alert");
  }
});

alertRouter.patch("/:id/status", async (req, res) => {
  try {
    const parsed = z.object({ status: z.enum(["Active", "Triggered", "Paused"]) }).safeParse(req.body);
    if (!parsed.success) return error(res, 400, "Invalid status", parsed.error.flatten());

    const result = await prisma.alert.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: { status: parsed.data.status }
    });

    if (result.count === 0) return error(res, 404, "Alert not found");

    return ok(res, null, "Alert status updated");
  } catch (err) {
    console.error("Alert Update Error:", err);
    return error(res, 500, "Failed to update alert");
  }
});

alertRouter.delete("/:id", async (req, res) => {
  try {
    const result = await prisma.alert.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });

    if (result.count === 0) return error(res, 404, "Alert not found");

    return ok(res, null, "Alert deleted");
  } catch (err) {
    console.error("Alert Delete Error:", err);
    return error(res, 500, "Failed to delete alert");
  }
});
