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
  console.log("Checking all custom types in DB...");
  const types = await prisma.$queryRaw`
    SELECT n.nspname as schema_name, t.typname as type_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e';
  `;
  console.log("Custom enums:", JSON.stringify(types, null, 2));

  // Check the values of LeadStatus specifically
  const leadStatusValues = await prisma.$queryRaw`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'LeadStatus';
  `;
  console.log("LeadStatus values:", JSON.stringify(leadStatusValues, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
