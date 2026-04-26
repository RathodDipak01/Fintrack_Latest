import { env } from "../config/env.js";

export async function generatePortfolioInsights(context) {
  if (!env.GEMINI_API_KEY) {
    return { 
      source: "mock", 
      analysis: "### API KEY MISSING\nPlease add your `GEMINI_API_KEY` to the backend `.env` file to enable professional AI portfolio analysis." 
    };
  }

  const { portfolioSummary, holdings, allocation, marketCapAllocation, userContext } = context;
  const { riskAppetite = "Medium", horizon = "Long Term (5-10 years)" } = userContext;

  const prompt = `
Act as a Precision Risk Strategist and Quant Analyst. Analyze this portfolio with a surgical focus on **Risk Exposure** and **Time-Horizon Alignment**. 

INPUT DATA:
* Holdings: ${JSON.stringify(holdings.map(h => ({ symbol: h.symbol, qty: h.qty, avg: h.avgCost || h.avg, sector: h.sector || 'N/A' })))}
* Horizon: ${horizon}
* Risk Profile: ${riskAppetite}
* Global Macro: High interest rates, fluctuating oil, tech momentum vs inflationary pressures.

OUTPUT REQUIREMENTS:
1. **RISK AUDIT**: (Keywords only - e.g., High Concentration, Volatility Spike, Sector Imbalance)
2. **HORIZON ALIGNMENT**: (Is this portfolio fit for ${horizon}? - Verdict + Reasoning in 3 bullet points)
3. **CORE VULNERABILITIES**: (Top 2 specific risks using financial keywords)
4. **TACTICAL ADVICE**: (Point-based: Buy/Sell/Trim actions for ${riskAppetite} risk appetite)
5. **KEYWORD SUMMARY**: (5 powerful keywords defining this portfolio's current state)

STRICT STYLE: Short points. No fluff. Keyword-heavy. Disciplined tone.
`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || "Gemini API failure");
    }

    const data = await response.json();
    const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return { 
      source: "gemini", 
      analysis: fullText 
    };
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return { 
      source: "mock", 
      analysis: "### AI Engine Unavailable\nWe encountered an error connecting to the AI analysis engine. Please verify your API key and network connection.\n\n**Error Details:** " + error.message
    };
  }
}
