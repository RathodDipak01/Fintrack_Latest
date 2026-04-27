import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Transporter configuration
// You can use Resend (recommended), Gmail, or Ethereal for testing
const transporter = nodemailer.createTransport({
  host: env.emailHost || 'smtp.resend.com',
  port: env.emailPort || 465,
  secure: true,
  auth: {
    user: env.emailUser || 'resend',
    pass: env.emailApiKey // Your Resend API Key or App Password
  }
});

/**
 * Send an OTP email to the user
 */
export async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `"Fintrack Security" <${env.emailFrom || 'otp@fintrack.app'}>`,
    to: toEmail,
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
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email Sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    // In dev mode, we might want to return true anyway and log the OTP
    if (env.nodeEnv === 'development') {
      console.log('DEVELOPMENT MODE: OTP is', otp);
      return true;
    }
    return false;
  }
}
