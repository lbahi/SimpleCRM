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
  const r = await prisma.$queryRaw`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status'`;
  console.log(JSON.stringify(r, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
