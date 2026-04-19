import express from "express";
import { z } from "zod";
import { users } from "../data/mockData.js";
import { createSession, destroySession, requireAuth } from "../middleware/auth.js";
import { error, ok } from "../utils/apiResponse.js";

export const authRouter = express.Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

authRouter.post("/signup", (req, res) => {
  const parsed = credentialsSchema.extend({ name: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "Invalid signup data", parsed.error.flatten());

  const existingUser = users.find((user) => user.email === parsed.data.email);
  if (existingUser) return error(res, 409, "User already exists");

  const user = {
    id: `user_${users.length + 1}`,
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    riskProfile: "Moderate"
  };
  users.push(user);

  const token = createSession(user.id);
  return ok(res, { token, user: sanitizeUser(user) }, "Signup successful");
});

authRouter.post("/login", (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return error(res, 400, "Invalid login data", parsed.error.flatten());

  const user = users.find((item) => item.email === parsed.data.email && item.password === parsed.data.password);
  if (!user) return error(res, 401, "Invalid email or password");

  const token = createSession(user.id);
  return ok(res, { token, user: sanitizeUser(user) }, "Login successful");
});

authRouter.post("/logout", requireAuth, (req, res) => {
  destroySession(req.token);
  return ok(res, null, "Logged out");
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = users.find((item) => item.id === req.userId);
  if (!user) return error(res, 404, "User not found");
  return ok(res, sanitizeUser(user));
});

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}
