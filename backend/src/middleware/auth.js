import crypto from "node:crypto";
import { error } from "../utils/apiResponse.js";

const sessions = new Map();

export function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { userId, createdAt: new Date().toISOString() });
  return token;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const session = sessions.get(token);

  if (!session) {
    return error(res, 401, "Authentication required");
  }

  req.userId = session.userId;
  req.token = token;
  return next();
}
