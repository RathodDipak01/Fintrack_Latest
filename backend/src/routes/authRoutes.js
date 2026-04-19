import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../db.js";
import { createSession, destroySession, requireAuth } from "../middleware/auth.js";
import { error, ok } from "../utils/apiResponse.js";

export const authRouter = express.Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

authRouter.post("/signup", async (req, res) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return error(res, 400, "Invalid signup data", parsed.error.flatten());

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingUser) return error(res, 409, "User already exists");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(parsed.data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash
      }
    });

    const token = createSession(user.id);
    return ok(res, { token, user: sanitizeUser(user) }, "Signup successful");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return error(res, 400, "Invalid login data", parsed.error.flatten());

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) return error(res, 401, "Invalid email or password");

    const isMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!isMatch) return error(res, 401, "Invalid email or password");

    const token = createSession(user.id);
    return ok(res, { token, user: sanitizeUser(user) }, "Login successful");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
});

authRouter.post("/logout", requireAuth, (req, res) => {
  destroySession(req.token);
  return ok(res, null, "Logged out");
});

authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return error(res, 404, "User not found");
    return ok(res, sanitizeUser(user));
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
});

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
