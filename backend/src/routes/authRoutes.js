import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../db.js";
import { createSession, destroySession, requireAuth } from "../middleware/auth.js";
import { error, ok } from "../utils/apiResponse.js";
import { sendOtpEmail } from "../services/emailService.js";

export const authRouter = express.Router();

// Temporary in-memory OTP store (Email -> { otp, expires })
const otpStore = new Map();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  fullName: z.string().optional(),
  otp: z.string().length(6).optional(),
  plan: z.string().optional()
});

/**
 * Route to generate and send OTP
 */
authRouter.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return error(res, 400, "Email is required");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 10-minute expiry
  otpStore.set(email, {
    otp,
    expires: Date.now() + 10 * 60 * 1000
  });

  const sent = await sendOtpEmail(email, otp);
  if (!sent) return error(res, 500, "Failed to send OTP email");

  return ok(res, null, "OTP sent successfully");
});

authRouter.post("/signup", async (req, res) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return error(res, 400, "Invalid signup data", parsed.error.flatten());
    
    const { email, otp, password, fullName, plan } = parsed.data;

    // Verify OTP
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return error(res, 401, "Invalid or expired OTP");
    }
    otpStore.delete(email); // Use once

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return error(res, 409, "User already exists");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        plan: plan || "free",
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

    const { email, password, otp } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return error(res, 401, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return error(res, 401, "Invalid email or password");

    // Verify OTP
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return error(res, 401, "Invalid or expired OTP");
    }
    otpStore.delete(email);

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

authRouter.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { fullName, plan } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(fullName && { fullName }),
        ...(plan && { plan })
      }
    });

    return ok(res, sanitizeUser(user), "Profile updated");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
});

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

