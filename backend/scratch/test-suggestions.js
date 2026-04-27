import { getTrendingStocks } from "../src/services/marketData.js";
import { generateAiSuggestions } from "../src/services/geminiService.js";

async function test() {
  try {
    console.log("Fetching trending stocks...");
    const trending = await getTrendingStocks();
    console.log("Found trending stocks:", trending.length);
    
    if (trending.length > 0) {
      console.log("Generating AI suggestions...");
      const suggested = await generateAiSuggestions(trending);
      console.log("Suggested count:", suggested.length);
      console.log("First suggestion:", JSON.stringify(suggested[0], null, 2));
    } else {
      console.log("No trending stocks found to suggest.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Test Error:", err);
    process.exit(1);
  }
}

test();
