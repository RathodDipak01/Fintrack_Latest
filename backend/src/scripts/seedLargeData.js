import { prisma } from '../db.js';
import { getSector } from '../utils/sectorMap.js';

const userId = "4b091032-eeef-44b6-8ed0-5f4fa40ef7cf";

const largeHoldings = [
  // IT
  { symbol: "TCS", name: "Tata Consultancy Services", qty: 25, avgCost: 3500, currentPrice: 3850 },
  { symbol: "INFY", name: "Infosys Ltd", qty: 40, avgCost: 1400, currentPrice: 1520 },
  { symbol: "WIPRO", name: "Wipro Ltd", qty: 100, avgCost: 420, currentPrice: 485 },
  { symbol: "HCLTECH", name: "HCL Technologies", qty: 30, avgCost: 1250, currentPrice: 1340 },
  { symbol: "SAKSOFT", name: "Saksoft Ltd", qty: 150, avgCost: 120, currentPrice: 148 },
  
  // Banking
  { symbol: "HDFCBANK", name: "HDFC Bank", qty: 60, avgCost: 1450, currentPrice: 1680 },
  { symbol: "ICICIBANK", name: "ICICI Bank", qty: 80, avgCost: 920, currentPrice: 1050 },
  { symbol: "SBIN", name: "State Bank of India", qty: 120, avgCost: 580, currentPrice: 760 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", qty: 35, avgCost: 1750, currentPrice: 1820 },
  { symbol: "AXISBANK", name: "Axis Bank", qty: 50, avgCost: 880, currentPrice: 1020 },
  
  // Energy
  { symbol: "RELIANCE", name: "Reliance Industries", qty: 20, avgCost: 2400, currentPrice: 2950 },
  { symbol: "ADANIPOWER", name: "Adani Power", qty: 200, avgCost: 180, currentPrice: 245 },
  { symbol: "ADANIGREEN", name: "Adani Green Energy", qty: 50, avgCost: 850, currentPrice: 980 },
  { symbol: "NTPC", name: "NTPC Ltd", qty: 300, avgCost: 160, currentPrice: 205 },
  { symbol: "POWERGRID", name: "Power Grid Corp", qty: 250, avgCost: 190, currentPrice: 235 },
  
  // Pharma
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", qty: 45, avgCost: 950, currentPrice: 1250 },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", qty: 15, avgCost: 3200, currentPrice: 3800 },
  { symbol: "DRREDDY", name: "Dr. Reddy's Lab", qty: 10, avgCost: 4800, currentPrice: 5400 },
  { symbol: "CIPLA", name: "Cipla Ltd", qty: 40, avgCost: 980, currentPrice: 1180 },
  
  // FMCG
  { symbol: "ITC", name: "ITC Ltd", qty: 500, avgCost: 380, currentPrice: 445 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", qty: 20, avgCost: 2350, currentPrice: 2550 },
  { symbol: "NESTLEIND", name: "Nestle India", qty: 5, avgCost: 19500, currentPrice: 22000 },
  { symbol: "DABUR", name: "Dabur India", qty: 100, avgCost: 520, currentPrice: 560 },
  
  // Auto
  { symbol: "MARUTI", name: "Maruti Suzuki", qty: 8, avgCost: 9500, currentPrice: 11500 },
  { symbol: "TATAMOTORS", name: "Tata Motors", qty: 150, avgCost: 420, currentPrice: 930 },
  { symbol: "M&M", name: "Mahindra & Mahindra", qty: 40, avgCost: 1250, currentPrice: 1650 },
  
  // Metals
  { symbol: "TATASTEEL", name: "Tata Steel", qty: 400, avgCost: 110, currentPrice: 145 },
  { symbol: "JINDALSTEL", name: "Jindal Steel & Power", qty: 80, avgCost: 540, currentPrice: 760 },
  
  // Telecom & Others
  { symbol: "BHARTIARTL", name: "Bharti Airtel", qty: 70, avgCost: 850, currentPrice: 1200 },
  { symbol: "ASIANPAINT", name: "Asian Paints", qty: 25, avgCost: 2800, currentPrice: 3100 },
  { symbol: "DLF", name: "DLF Ltd", qty: 100, avgCost: 450, currentPrice: 880 },
  { symbol: "LT", name: "Larsen & Toubro", qty: 30, avgCost: 2100, currentPrice: 3450 }
];

async function seed() {
  console.log("Cleaning up existing holdings...");
  await prisma.portfolioHolding.deleteMany({ where: { userId } });

  console.log(`Seeding ${largeHoldings.length} holdings...`);
  const data = largeHoldings.map(h => ({
    ...h,
    sector: getSector(h.symbol),
    userId: userId,
    productType: "CNC"
  }));

  await prisma.portfolioHolding.createMany({ data });
  console.log("Seeding complete!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
