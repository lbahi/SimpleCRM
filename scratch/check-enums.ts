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
  console.log("Checking enum types in DB...");
  const enumValues = await prisma.$queryRaw`
    SELECT n.nspname as enum_schema,  
           t.typname as enum_name,  
           e.enumlabel as enum_value
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'LeadStatus';
  `;
  console.log("LeadStatus enum values in DB:", JSON.stringify(enumValues, null, 2));

  // Also check if there's a lowercase version or something
  const allEnums = await prisma.$queryRaw`
    SELECT t.typname as enum_name, e.enumlabel as enum_value
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname ILIKE '%status%';
  `;
  console.log("All status-like enums in DB:", JSON.stringify(allEnums, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
