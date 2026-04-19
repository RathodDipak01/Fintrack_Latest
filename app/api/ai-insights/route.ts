import { NextResponse } from "next/server";

const fallbackInsights = [
  "ADANIPOWER momentum is positive after a 28.6% three-month move.",
  "Mutual fund participation improved, but retail concentration should be watched.",
  "A Beginner-friendly action is to research gradually, set alerts, and avoid acting on one signal alone."
];

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const payload = await request.json().catch(() => ({}));
  const prompt = [
    "You are an Indian equity portfolio assistant.",
    "Return exactly three concise, beginner-friendly insights.",
    "Avoid guarantees. Mention risk when relevant.",
    `Portfolio context: ${JSON.stringify(payload)}`
  ].join("\n");

  if (!apiKey) {
    return NextResponse.json({ source: "mock", insights: fallbackInsights });
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 220
        }
      })
    });

    if (!response.ok) {
      return NextResponse.json({ source: "mock", insights: fallbackInsights, warning: "Gemini request failed; mock insights shown." });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).filter(Boolean).join("\n") ?? "";
    const insights = text
      .split(/\n+/)
      .map((line: string) => line.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return NextResponse.json({ source: "gemini", insights: insights.length ? insights : fallbackInsights });
  } catch {
    return NextResponse.json({ source: "mock", insights: fallbackInsights, warning: "Gemini unavailable; mock insights shown." });
  }
}
