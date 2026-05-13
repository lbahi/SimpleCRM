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
  console.log("Checking last 10 leads...");
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      phone: true,
      email: true,
    }
  });

  console.log("LEADS DUMP:");
  console.table(leads);
  
  const total = await prisma.lead.count();
  console.log("Total leads:", total);

  // Check for leads with non-standard statuses if possible
  // Since Prisma enforces enum, we might need a raw query to see if there's "messy" data
  const rawStatuses = await prisma.$queryRaw`SELECT DISTINCT status FROM leads`;
  console.log("Distinct statuses in DB:", rawStatuses);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
