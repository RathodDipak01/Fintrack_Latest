import { prisma } from "../src/db.js";

async function test() {
  try {
    console.log("Testing Alert model...");
    const alerts = await prisma.alert.findMany();
    console.log("Success! Found alerts count:", alerts.length);
    process.exit(0);
  } catch (err) {
    console.error("DB Test Error:", err);
    process.exit(1);
  }
}

test();
