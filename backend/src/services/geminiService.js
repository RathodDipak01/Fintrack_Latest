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

export async function generateMarketStrategy(newsItems) {
  if (!env.GEMINI_API_KEY) {
    return "MARKET UPDATE: Global markets showing mixed signals. Connect your API key for deep AI strategy.";
  }

  const newsContext = newsItems.map(n => `- ${n.title} (${n.publisher})`).join("\n");
  
  const prompt = `
Act as a Senior Market Strategist. Analyze these recent news headlines and provide a SINGLE-SENTENCE tactical advice for a retail investor.

NEWS:
${newsContext}

REQUIREMENTS:
- Maximum 20 words.
- Format: "STRATEGY: [Your advice]"
- Be specific (e.g., Mention a sector or a sentiment).
- Professional and action-oriented.
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
        generationConfig: { temperature: 0.3, maxOutputTokens: 100 }
      })
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "STRATEGY: Markets volatile; maintain stop-losses and focus on blue-chip stability.";
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    return "STRATEGY: Monitor indices for key support levels; stay defensive in high-beta sectors.";
  }
}

export async function generateStockSignal(symbol, newsItems) {
  if (!env.GEMINI_API_KEY) {
    return {
      symbol,
      signal: "Neutral",
      confidence: 50,
      note: "API Key missing. Cannot generate real-time AI signal."
    };
  }

  const newsContext = newsItems.length > 0 ? newsItems.map(n => `- ${n.title}`).join("\n") : "No recent news available.";
  
  const prompt = `
Act as an expert quantitative stock analyst. Analyze the following recent news for the stock ticker '${symbol}' and provide a recommendation signal.

RECENT NEWS:
${newsContext}

OUTPUT REQUIREMENTS:
Provide ONLY a valid JSON object with the following exact keys, no markdown formatting, no code blocks:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": <integer between 0 and 100>,
  "note": "<A single short sentence explaining the reasoning based on the news>"
}
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
        generationConfig: { temperature: 0.1, maxOutputTokens: 150 }
      })
    });

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    // Remove markdown code blocks if any
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(text);
      return {
        symbol,
        signal: parsed.signal || "Neutral",
        confidence: parsed.confidence || 50,
        note: parsed.note || "Analysis completed with neutral bias."
      };
    } catch (e) {
      console.error("Failed to parse Gemini signal JSON:", text);
      return { symbol, signal: "Neutral", confidence: 50, note: "AI returned unparseable format." };
    }
  } catch (error) {
    console.error(`Gemini Signal Error for ${symbol}:`, error);
    return { symbol, signal: "Neutral", confidence: 50, note: "Error communicating with AI engine." };
  }
}

export async function orchestrateMlStrategy(symbol) {
  if (!env.pythonApiUrl) {
    throw new Error("PYTHON_API_URL is not configured in .env");
  }

  // 1. Format symbol for Python API (e.g., ADANIPOWER-EQ -> ADANIPOWER.NS)
  let cleanSymbol = symbol.split('-')[0]; // Remove -EQ, -BE etc.
  const querySymbol = cleanSymbol.includes('.') ? cleanSymbol : `${cleanSymbol}.NS`;


  let mlData;
  try {
    const pyResponse = await fetch(`${env.pythonApiUrl}/${querySymbol}`);
    if (!pyResponse.ok) {
      throw new Error(`Python API returned status ${pyResponse.status}`);
    }
    mlData = await pyResponse.json();
  } catch (error) {
    console.error("Python ML API Error:", error.message);
    throw new Error("Failed to fetch data from Machine Learning engine.");
  }

  if (!env.GEMINI_API_KEY) {
    return {
      raw_data: mlData,
      analysis: "### API KEY MISSING\nPlease add your `GEMINI_API_KEY` to see the synthesized report."
    };
  }

  // 2. Synthesize using Gemini
  const prompt = `Act as a Senior Quant Analyst. Synthesize the following machine learning model outputs for ${symbol}:

DATA:
- Time-Series (Prophet): Projects a 30-day price of ${mlData.prophet?.forecast_30d} (${mlData.prophet?.trend}).
- Classifier (XGBoost): ${(mlData.xgboost?.confidence * 100).toFixed(2)}% confident in a ${mlData.xgboost?.direction} move.
- NLP Sentiment (FinBERT): ${mlData.finbert?.label} (Score: ${mlData.finbert?.score}).

TASK:
Write a professional, 3-paragraph strategy report.
1. The VERY FIRST LINE of your response MUST BE EXACTLY one of these three: "FINAL SIGNAL: BUY", "FINAL SIGNAL: SELL", or "FINAL SIGNAL: HOLD".
2. After a blank line, resolve any conflicts (e.g., if Prophet is bullish but sentiment is negative, explain why).
3. Provide a clear reasoning for the current market state.
4. Conclude with a tactical recommendation.`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
      })
    });

    if (!response.ok) {
      throw new Error("Gemini API failure during synthesis");
    }

    const data = await response.json();
    const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate analysis.";
    
    // 3. Return the combined payload
    return {
      raw_data: mlData,
      analysis: fullText
    };
  } catch (error) {
    console.error("Gemini Synthesis Error:", error.message);
    return {
      raw_data: mlData,
      analysis: "### Synthesis Failed\nThe ML data was retrieved successfully, but the AI synthesis engine failed to respond. \n\nError: " + error.message
    };
  }
}

