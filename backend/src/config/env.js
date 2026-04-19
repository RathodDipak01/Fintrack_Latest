import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "fallback_super_secret_dev_key",
  angelApiKey: process.env.ANGEL_API_KEY || "",
  angelApiSecret: process.env.ANGEL_API_SECRET || "",
  databaseUrl: process.env.DATABASE_URL || ""
};
