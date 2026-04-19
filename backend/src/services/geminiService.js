import { env } from "../config/env.js";

const fallbackInsights = [
  "Portfolio risk is moderate because gains are concentrated in a few sectors.",
  "ADANIPOWER has positive momentum, but the suggestion should be reviewed with risk tolerance.",
  "Set alerts for IT exposure and support breaks before making any investment decision."
];

export async function generatePortfolioInsights(context) {
  if (!env.geminiApiKey) {
    return { source: "mock", insights: fallbackInsights };
  }

  const prompt = [
    "You are an Indian equity research assistant for a suggestion-only app.",
    "Do not say the user can buy or sell through this app.",
    "Return exactly three concise beginner-friendly insights.",
    "Mention risk and explain the reason behind each suggestion.",
    `Context: ${JSON.stringify(context)}`
  ].join("\n");

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey
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
      return { source: "mock", insights: fallbackInsights, warning: "Gemini request failed" };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") || "";
    const insights = text
      .split(/\n+/)
      .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return { source: "gemini", insights: insights.length ? insights : fallbackInsights };
  } catch {
    return { source: "mock", insights: fallbackInsights, warning: "Gemini unavailable" };
  }
}
