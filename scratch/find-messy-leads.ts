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
  console.log("Searching for messy leads...");
  const leads = await prisma.$queryRaw`
    SELECT id, name, status FROM leads 
    WHERE status::text NOT IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')
    OR status IS NULL
  `;
  console.log("Messy leads found:", JSON.stringify(leads, null, 2));

  const allLeads = await prisma.lead.findMany({
    select: { id: true, name: true, status: true }
  });
  console.log("All leads count:", allLeads.length);
  console.log("Status distribution:");
  const counts: Record<string, number> = {};
  allLeads.forEach(l => {
    const s = String(l.status);
    counts[s] = (counts[s] || 0) + 1;
  });
  console.table(counts);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
