import express from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { created, error, ok } from "../utils/apiResponse.js";
import { getSector } from "../utils/sectorMap.js";
import { getLivePrices } from "../services/marketData.js";
// Mock data summary structures untouched for phase 1 transition
import { allocation, portfolioSummary } from "../data/mockData.js";

export const portfolioRouter = express.Router();

portfolioRouter.use(requireAuth);

const holdingSchema = z.object({
  symbol: z.string().min(1).transform((value) => value.toUpperCase()),
  name: z.string().optional(),
  qty: z.number().finite().nonnegative(),
  avgCost: z.number().finite().nonnegative(),
  productType: z.string().optional(),
  currentPrice: z.number().finite().nonnegative().optional()
});

const bulkHoldingsSchema = z.array(holdingSchema);

portfolioRouter.get("/summary", async (req, res) => {
  try {
    const holdings = await prisma.portfolioHolding.findMany({ where: { userId: req.userId } });
    
    // Inject live prices
    const symbols = [...new Set(holdings.map(h => h.symbol))];
    const livePrices = await getLivePrices(symbols);
    
    const totalInvestment = holdings.reduce((sum, h) => sum + h.qty * h.avgCost, 0);
    const currentValue = holdings.reduce((sum, h) => {
      const livePrice = livePrices[h.symbol] || h.currentPrice || h.avgCost;
      return sum + h.qty * livePrice;
    }, 0);
    const totalReturns = currentValue - totalInvestment;
    
    // Add realistic 1-day change based on live price vs DB price (simulating day close)
    const yesterdayValue = holdings.reduce((sum, h) => sum + h.qty * (h.currentPrice || h.avgCost), 0);
    const todayChange = currentValue - yesterdayValue;
    const todayChangePercent = yesterdayValue > 0 ? (todayChange / yesterdayValue) * 100 : 0;
    
    return ok(res, {
      totalInvestment: parseFloat(totalInvestment.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      totalReturns: parseFloat(totalReturns.toFixed(2)),
      todayChange: parseFloat(todayChange.toFixed(2)),
      todayChangePercent: parseFloat(todayChangePercent.toFixed(2)),
      riskScore: 65,
      diversification: holdings.length > 5 ? "Well diversified" : "Concentrated"
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Error calculating summary");
  }
});

portfolioRouter.get("/allocation", async (req, res) => {
  try {
    const holdings = await prisma.portfolioHolding.findMany({ where: { userId: req.userId } });
    
    // Inject live prices
    const symbols = [...new Set(holdings.map(h => h.symbol))];
    const livePrices = await getLivePrices(symbols);
    
    const totalValue = holdings.reduce((sum, h) => {
      const livePrice = livePrices[h.symbol] || h.currentPrice || h.avgCost;
      return sum + h.qty * livePrice;
    }, 0);
    
    if (totalValue === 0) return ok(res, { sectors: [], marketCap: [] });

    // Group by sector
    const sectorGroups = holdings.reduce((acc, h) => {
      const livePrice = livePrices[h.symbol] || h.currentPrice || h.avgCost;
      const val = h.qty * livePrice;
      // Use getSector if h.sector is missing or generic 'Diversified'
      let sector = h.sector;
      if (!sector || sector === "Diversified" || sector === "General") {
        sector = getSector(h.symbol);
      }
      acc[sector] = (acc[sector] || 0) + val;
      return acc;
    }, {});

    // Group by market cap
    const capGroups = holdings.reduce((acc, h) => {
      const livePrice = livePrices[h.symbol] || h.currentPrice || h.avgCost;
      const val = h.qty * livePrice;
      const mc = h.marketCap || 0;
      let category = "Small cap";
      if (mc > 2000000000000) category = "Large cap";
      else if (mc > 50000000000) category = "Mid cap";
      
      acc[category] = (acc[category] || 0) + val;
      return acc;
    }, {});

    const sectors = Object.entries(sectorGroups).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(2))
    })).sort((a, b) => b.value - a.value);

    const marketCap = Object.entries(capGroups).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(2))
    })).sort((a, b) => {
      const order = ["Large cap", "Mid cap", "Small cap"];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return ok(res, { sectors, marketCap });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Error calculating allocation");
  }
});

portfolioRouter.post("/bulk", async (req, res) => {
  try {
    const parsed = bulkHoldingsSchema.safeParse(req.body);
    if (!parsed.success) return error(res, 400, "Invalid bulk data", parsed.error.flatten());

    // Transaction: Clear current holdings and insert new ones
    await prisma.$transaction([
      prisma.portfolioHolding.deleteMany({ where: { userId: req.userId } }),
      prisma.portfolioHolding.createMany({
        data: parsed.data.map(h => ({
          ...h,
          name: h.name || h.symbol,
          sector: getSector(h.symbol),
          userId: req.userId
        }))
      })
    ]);

    return ok(res, { count: parsed.data.length }, "Portfolio bulk updated successfully");
  } catch (err) {
    console.error("Bulk Import Error:", err);
    return error(res, 500, `Error performing bulk import: ${err.message}`);
  }
});

portfolioRouter.get("/holdings", async (req, res) => {
  try {
    const userHoldings = await prisma.portfolioHolding.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Inject live prices
    const symbols = [...new Set(userHoldings.map(h => h.symbol))];
    const livePrices = await getLivePrices(symbols);
    
    // Add computed metrics and enrich sector on the fly
    const enrichedHoldings = userHoldings.map(h => {
      let sector = h.sector;
      if (!sector || sector === "Diversified" || sector === "General") {
        sector = getSector(h.symbol);
      }
      const livePrice = livePrices[h.symbol] || h.currentPrice || h.avgCost;
      return {
        ...h,
        sector,
        currentPrice: livePrice,
        changePercent: livePrice ? (((livePrice - h.avgCost) / h.avgCost) * 100).toFixed(2) : 0,
        pnl: livePrice ? ((livePrice - h.avgCost) * h.qty).toFixed(2) : 0
      };
    });
    
    return ok(res, enrichedHoldings);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Error fetching holdings");
  }
});

portfolioRouter.post("/holdings", async (req, res) => {
  try {
    const parsed = holdingSchema.safeParse(req.body);
    if (!parsed.success) return error(res, 400, "Invalid holding data", parsed.error.flatten());

    const newHolding = await prisma.portfolioHolding.create({
      data: {
        userId: req.userId,
        ...parsed.data,
        name: parsed.data.name || parsed.data.symbol
      }
    });
    return created(res, newHolding, "Holding added successfully");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Error creating holding");
  }
});

portfolioRouter.patch("/holdings/:id", async (req, res) => {
  try {
    const updatedUserHolding = await prisma.portfolioHolding.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: req.body
    });
    if (updatedUserHolding.count === 0) return error(res, 404, "Holding not found or unauthorized");
    return ok(res, null, "Holding updated");
  } catch(err) {
    console.error(err);
    return error(res, 500, "Failed to update holding");
  }
});

portfolioRouter.delete("/holdings/:id", async (req, res) => {
  try {
    const deleteCount = await prisma.portfolioHolding.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    if (deleteCount.count === 0) return error(res, 404, "Holding not found or unauthorized");
    return ok(res, null, "Holding removed successfully");
  } catch(err) {
    console.error(err);
    return error(res, 500, "Failed to delete holding");
  }
});
