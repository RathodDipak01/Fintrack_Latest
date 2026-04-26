import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const holdings = await prisma.portfolioHolding.findMany();
  for (const h of holdings) {
    const val = h.qty * (h.currentPrice || h.avgCost);
    console.log(`${h.symbol}: val=${val.toFixed(2)}`);
  }
}
main();
