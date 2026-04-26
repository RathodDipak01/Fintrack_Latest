import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "fallback_super_secret_dev_key",
  angelApiKey: process.env.ANGEL_API_KEY || "",
  angelApiSecret: process.env.ANGEL_API_SECRET || "",
  angelClientId: process.env.ANGEL_CLIENT_ID || "",
  angelPassword: process.env.ANGEL_PASSWORD || "",
  angelTotpSecret: process.env.ANGEL_TOTP_SECRET || "",
  zerodhaApiKey: process.env.KITE_API_KEY || "",
  zerodhaApiSecret: process.env.KITE_API_SECRET || "",
  upstoxApiKey: process.env.UPSTOX_API_KEY || "",
  upstoxApiSecret: process.env.UPSTOX_API_SECRET || "",
  growwApiKey: process.env.GROWW_API_KEY || "",
  growwApiSecret: process.env.GROWW_API_SECRET || "",
  databaseUrl: process.env.DATABASE_URL || ""
};
