import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';

const connectionString = env.databaseUrl || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const holdings = [
  { symbol: "ADANIENT", name: "Adani Enterprises", qty: 2, avgCost: 2040.85, productType: "CNC", currentPrice: 2043.8 },
  { symbol: "ADANIGREEN", name: "Adani Green Energy", qty: 3, avgCost: 1027.9, productType: "CNC", currentPrice: 1029.65 },
  { symbol: "ASHOKLEY", name: "Ashok Leyland", qty: 30, avgCost: 172.3, productType: "CNC", currentPrice: 172.48 },
  { symbol: "CDSL", name: "Central Depository Services", qty: 3, avgCost: 1284.0, productType: "CNC", currentPrice: 1287.4 },
  { symbol: "CHOLAHLDNG", name: "Cholamandalam Financial", qty: 6, avgCost: 1675.9, productType: "CNC", currentPrice: 1633.8 },
  { symbol: "EIEL", name: "Eimco Elecon", qty: 25, avgCost: 171.1, productType: "CNC", currentPrice: 171.08 },
  { symbol: "FIEMIND", name: "Fiem Industries", qty: 3, avgCost: 2154.1, productType: "CNC", currentPrice: 2161.3 },
  { symbol: "SAKSOFT", name: "Saksoft Ltd", qty: 30, avgCost: 137.28, productType: "CNC", currentPrice: 137.93 },
  { symbol: "EIEL", name: "Eimco Elecon (Intraday)", qty: 0, avgCost: 0, productType: "MIS", currentPrice: 171.08 },
  { symbol: "INDIGO", name: "InterGlobe Aviation", qty: 0, avgCost: 0, productType: "MIS", currentPrice: 4615.5 },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance", qty: 0, avgCost: 0, productType: "MIS", currentPrice: 1023.2 },
  { symbol: "TMCV", name: "Tata Motors CV", qty: 0, avgCost: 0, productType: "MIS", currentPrice: 434.05 }
];

const watchlist = [
  { symbol: "ADANIENT", alertText: "Momentum alert active" },
  { symbol: "CDSL", alertText: "Consolidation breakdown watch" },
  { symbol: "SAKSOFT", alertText: "Near support zone" }
];

async function main() {
  const existingUser = await prisma.user.findUnique({ where: { email: 'deepak@fintrack.app' } });
  if (existingUser) {
    console.log("Deepak User already exists, clearing old holdings/watchlist and re-seeding with new format.");
    await prisma.portfolioHolding.deleteMany({ where: { userId: existingUser.id }});
    await prisma.watchlist.deleteMany({ where: { userId: existingUser.id }});
    
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        holdings: {
          create: holdings
        },
        watchlist: {
          create: watchlist
        }
      }
    });

    console.log("Re-seeded successfully with CNC/MIS distinction.");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('mockpass', salt);

  const mockUser = await prisma.user.create({
    data: {
      email: 'deepak@fintrack.app',
      passwordHash,
      holdings: {
        create: holdings
      },
      watchlist: {
        create: watchlist
      }
    }
  });

  console.log(`Database seeded with user: ${mockUser.email} and custom screenshot data.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
