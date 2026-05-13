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
  console.log("Cleaning up messy lead data...");
  
  // 1. Find leads with null or empty names/phones
  const missingData = await prisma.lead.findMany({
    where: {
      OR: [
        { name: "" },
        { phone: "" }
      ]
    }
  });
  console.log(`Found ${missingData.length} leads with missing name/phone.`);
  
  // 2. Fix invalid statuses using raw SQL to bypass Prisma enum checks
  const result = await prisma.$executeRaw`
    UPDATE leads 
    SET status = 'NEW' 
    WHERE status::text NOT IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')
    OR status IS NULL
  `;
  console.log(`Updated ${result} leads with invalid statuses to 'NEW'.`);

  // 3. Ensure every lead has a name
  const nameFix = await prisma.$executeRaw`
    UPDATE leads 
    SET name = 'Unknown Lead' 
    WHERE name IS NULL OR name = ''
  `;
  console.log(`Fixed names for ${nameFix} leads.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
