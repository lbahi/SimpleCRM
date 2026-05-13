import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not defined");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Dumping all leads...");
  const leads = await prisma.$queryRaw`SELECT * FROM leads`;
  console.log(JSON.stringify(leads, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
