import * as yahooFinance from 'yahoo-finance2';

async function test() {
  const query = process.argv[2] || 'Reliance';
  console.log(`Testing custom fetch search for: ${query}`);
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const results = await response.json();
    console.log('--- RAW RESULTS ---');
    console.log(JSON.stringify(results, null, 2));
    
    const filtered = results.quotes
      .filter(q => q.symbol)
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType,
        exchange: q.exchDisp
      }));
      
    console.log('\n--- MAPPED RESULTS ---');
    console.log(filtered);
  } catch (err) {
    console.error('Search failed:', err);
  }
}

test();
