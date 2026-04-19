import { NextResponse } from "next/server";
import type { BrokerId } from "@/lib/portfolio-import";
import { BROKERS } from "@/lib/portfolio-import";

const ids = new Set(BROKERS.map((b) => b.id));

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const brokerId = body.brokerId as BrokerId | undefined;

  if (!brokerId || !ids.has(brokerId)) {
    return NextResponse.json(
      { success: false, message: "Unknown brokerId. Use zerodha, angel_one, groww, or upstox." },
      { status: 400 }
    );
  }

  const broker = BROKERS.find((b) => b.id === brokerId)!;

  return NextResponse.json({
    success: true,
    status: "oauth_placeholder",
    broker: broker.name,
    message:
      "Live broker sync is not enabled in this build. Production will redirect through the broker’s OAuth consent and pull holdings via their official API.",
    nextSteps: [
      "Register a developer app with the broker",
      "Store API credentials securely (server-side only)",
      "Complete OAuth and exchange tokens for portfolio read access",
      "Map broker symbols to ISIN / exchange codes for analysis"
    ],
    documentationHint: broker.apiNote
  });
}
