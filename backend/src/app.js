import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { error } from "./utils/apiResponse.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api", apiRouter);

app.use((req, res) => error(res, 404, "Route not found"));

app.use((err, req, res, next) => {
  console.error(err);
  return error(res, 500, "Internal server error");
});
