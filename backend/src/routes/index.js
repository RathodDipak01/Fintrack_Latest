import express from "express";
import { aiRouter } from "./aiRoutes.js";
import { alertRouter } from "./alertRoutes.js";
import { authRouter } from "./authRoutes.js";
import { portfolioRouter } from "./portfolioRoutes.js";
import { stockRouter } from "./stockRoutes.js";
import { suggestionRouter } from "./suggestionRoutes.js";
import { watchlistRouter } from "./watchlistRoutes.js";
import marketRouter from "./marketRoutes.js";
import brokerRouter from "./brokerRoutes.js";

export const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
    data: {
      service: "Fintrack suggestion API",
      timestamp: new Date().toISOString()
    }
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/portfolio", portfolioRouter);
apiRouter.use("/watchlist", watchlistRouter);
apiRouter.use("/alerts", alertRouter);
apiRouter.use("/suggestions", suggestionRouter);
apiRouter.use("/stocks", stockRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/market", marketRouter);
apiRouter.use("/broker", brokerRouter);
