import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Lead Statuses...");
  const leads = await prisma.lead.findMany({
    select: { id: true, status: true }
  });

  const statusCounts = leads.reduce((acc: any, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  console.log("Current Status Counts:", statusCounts);

  // If we want to fix them, we could do it here, but we need to migrate first.
  // Actually, we can't update to "NEW" until the DB knows about "NEW".
}

main().catch(console.error).finally(() => prisma.$disconnect());
