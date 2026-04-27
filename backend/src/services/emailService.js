import { Resend } from 'resend';
import { env } from '../config/env.js';

// Initialize Resend SDK
const resend = new Resend(env.emailApiKey);

/**
 * Send an OTP email to the user using Resend SDK
 */
export async function sendOtpEmail(toEmail, otp) {
  // If no API key, skip and log to terminal
  if (!env.emailApiKey || env.emailApiKey.startsWith('re_your_')) {
    console.warn('Email API Key missing - falling back to terminal');
    logToTerminal(toEmail, otp);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: env.emailFrom || 'onboarding@resend.dev',
      to: [toEmail],
      subject: `${otp} is your Fintrack verification code`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6; text-align: center;">Fintrack</h2>
          <p>Hello,</p>
          <p>To keep your account secure, please use the following one-time password (OTP) to complete your sign-in:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 10px; color: #94a3b8; text-align: center;">© 2026 Fintrack AI. Secure Wealth Management.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      logToTerminal(toEmail, otp);
      return true;
    }

    console.log('OTP Email Sent via Resend API:', data.id);
    return true;
  } catch (err) {
    console.error('Email Service Exception:', err.message);
    logToTerminal(toEmail, otp);
    return true;
  }
}

function logToTerminal(email, otp) {
  console.log('--- OTP FALLBACK (Terminal) ---');
  console.log(`Email: ${email}`);
  console.log(`Code: ${otp}`);
  console.log('-------------------------------');
}

