import { NextResponse } from "next/server";
import { parseHoldingsCsv } from "@/lib/portfolio-import";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const csvText = typeof body.csvText === "string" ? body.csvText : "";

  if (!csvText.trim()) {
    return NextResponse.json({ success: false, message: "Missing csvText" }, { status: 400 });
  }

  const { holdings, errors } = parseHoldingsCsv(csvText);

  if (holdings.length === 0) {
    return NextResponse.json({
      success: false,
      holdings: [],
      errors,
      message: "No holdings could be parsed from this file."
    });
  }

  const invested = holdings.reduce((s, h) => s + h.qty * h.avgCost, 0);
  const current =
    holdings.reduce((s, h) => {
      const px = h.currentPrice ?? h.avgCost;
      return s + h.qty * px;
    }, 0) - invested;

  return NextResponse.json({
    success: true,
    holdings,
    errors: errors.length ? errors : undefined,
    summary: {
      positions: holdings.length,
      investedApprox: Math.round(invested),
      unrealizedApprox: Math.round(current)
    },
    message: "Holdings normalized. Use these rows for allocation and AI analysis in Fintrack."
  });
}
