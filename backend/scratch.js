import { SmartAPI } from "smartapi-javascript";
import { generateSync } from "otplib";
import dotenv from 'dotenv';
dotenv.config();

const smartApi = new SmartAPI({
  api_key: process.env.ANGEL_API_KEY,
});

async function run() {
  try {
    const totp = generateSync({ secret: process.env.ANGEL_TOTP_SECRET });
    const session = await smartApi.generateSession(
      process.env.ANGEL_CLIENT_ID,
      process.env.ANGEL_PASSWORD,
      totp
    );
    console.log("Session:", session.status);

    const md = await smartApi.marketData({
      mode: "FULL",
      exchangeTokens: {
        "NSE": ["26000", "26009"],
        "BSE": ["999901"]
      }
    });
    console.log("Market Data:", JSON.stringify(md, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
