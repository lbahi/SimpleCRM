import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- PostgreSQL Tables ---");
  const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
  
  if (Array.isArray(tables)) {
    for (const table of tables) {
      const count: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "public"."${table.tablename}"`);
      console.log(`- ${table.tablename}: ${count[0].count} rows`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
