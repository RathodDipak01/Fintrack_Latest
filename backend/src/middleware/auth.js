import jwt from "jsonwebtoken";
import { error } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_dev_key";

export function createSession(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function destroySession(token) {
  // Can implement blacklist or trust short expiries.
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  
  if (!token) {
    return error(res, 401, "Authentication required");
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.token = token;
    return next();
  } catch (err) {
    return error(res, 401, "Invalid or expired token");
  }
}
