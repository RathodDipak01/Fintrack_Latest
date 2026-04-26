import express from "express";
import { syncAngelOneHoldings } from "../services/angelOne.js";
import { syncZerodhaHoldings } from "../services/zerodha.js";
import { syncUpstoxHoldings } from "../services/upstox.js";
import { syncGrowwHoldings } from "../services/groww.js";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getSector } from "../utils/sectorMap.js";
import { ok, error } from "../utils/apiResponse.js";

const router = express.Router();

/**
 * Helper to perform the database sync (delete specific source, insert new)
 */
async function performDatabaseSync(userId, holdings, source) {
  if (!holdings || !Array.isArray(holdings)) {
    throw new Error(`Invalid holdings received for ${source}`);
  }

  // Only delete holdings from THIS specific source to allow combining multiple brokers
  return await prisma.$transaction([
    prisma.portfolioHolding.deleteMany({ 
      where: { 
        userId,
        source: source 
      } 
    }),
    prisma.portfolioHolding.createMany({
      data: holdings.map((h) => ({
        ...h,
        sector: getSector(h.symbol),
        userId,
        source: source
      })),
    }),
  ]);
}

/**
 * @route   POST /api/broker/sync/angelone
 */
router.post("/sync/angelone", requireAuth, async (req, res) => {
  try {
    const holdings = await syncAngelOneHoldings();
    await performDatabaseSync(req.userId, holdings, "ANGEL_ONE");
    return ok(res, null, `Portfolio synced with Angel One (${holdings.length} holdings)`);
  } catch (err) {
    console.error("Angel One Sync Error:", err);
    return error(res, 500, err.message);
  }
});

/**
 * @route   POST /api/broker/sync/zerodha
 */
router.post("/sync/zerodha", requireAuth, async (req, res) => {
  try {
    const holdings = await syncZerodhaHoldings(req.body.requestToken, req.token);
    
    if (holdings.requiresRedirect) {
      return ok(res, { loginUrl: holdings.loginUrl }, "Redirect required");
    }

    await performDatabaseSync(req.userId, holdings, "ZERODHA");
    return ok(res, null, `Portfolio synced with Zerodha (${holdings.length} holdings)`);
  } catch (err) {
    console.error("Zerodha Sync Error:", err);
    return error(res, 500, err.message);
  }
});

/**
 * @route   POST /api/broker/sync/upstox
 */
router.post("/sync/upstox", requireAuth, async (req, res) => {
  try {
    const holdings = await syncUpstoxHoldings(req.body.authCode, req.token);
    
    if (holdings.requiresRedirect) {
      return ok(res, { loginUrl: holdings.loginUrl }, "Redirect required");
    }

    await performDatabaseSync(req.userId, holdings, "UPSTOX");
    return ok(res, null, `Portfolio synced with Upstox (${holdings.length} holdings)`);
  } catch (err) {
    console.error("Upstox Sync Error:", err);
    return error(res, 500, err.message);
  }
});

/**
 * @route   POST /api/broker/sync/groww
 */
router.post("/sync/groww", requireAuth, async (req, res) => {
  try {
    const holdings = await syncGrowwHoldings(req.body.accessToken);
    await performDatabaseSync(req.userId, holdings, "GROWW");
    return ok(res, null, `Portfolio synced with Groww (${holdings.length} holdings)`);
  } catch (err) {
    console.error("Groww Sync Error:", err);
    return error(res, 500, err.message);
  }
});

/**
 * @route   GET /api/broker/callback/zerodha
 */
router.get("/callback/zerodha", requireAuth, async (req, res) => {
  const { request_token } = req.query;
  try {
    const holdings = await syncZerodhaHoldings(request_token);
    await performDatabaseSync(req.userId, holdings, "ZERODHA");
    return res.send("<h1>Sync Successful!</h1><p>You can close this window now.</p><script>setTimeout(() => window.close(), 2000)</script>");
  } catch (err) {
    return res.status(500).send(`<h1>Sync Failed</h1><p>${err.message}</p>`);
  }
});

/**
 * @route   GET /api/broker/callback/upstox
 */
router.get("/callback/upstox", requireAuth, async (req, res) => {
  const { code } = req.query;
  try {
    const holdings = await syncUpstoxHoldings(code);
    await performDatabaseSync(req.userId, holdings, "UPSTOX");
    return res.send("<h1>Sync Successful!</h1><p>You can close this window now.</p><script>setTimeout(() => window.close(), 2000)</script>");
  } catch (err) {
    return res.status(500).send(`<h1>Sync Failed</h1><p>${err.message}</p>`);
  }
});

/**
 * @route   DELETE /api/broker/disconnect/:source
 * @desc    Remove holdings from a specific source
 */
router.delete("/disconnect/:source", requireAuth, async (req, res) => {
  const { source } = req.params;
  try {
    await prisma.portfolioHolding.deleteMany({
      where: {
        userId: req.userId,
        source: source.toUpperCase()
      }
    });
    return ok(res, null, `Disconnected ${source} and removed holdings.`);
  } catch (err) {
    return error(res, 500, err.message);
  }
});

/**
 * @route   GET /api/broker/connections
 * @desc    Get list of connected brokers
 */
router.get("/connections", requireAuth, async (req, res) => {
  try {
    const sources = await prisma.portfolioHolding.groupBy({
      by: ['source'],
      where: { userId: req.userId },
      _count: true
    });
    return ok(res, sources);
  } catch (err) {
    return error(res, 500, err.message);
  }
});

export default router;
