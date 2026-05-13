import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  const users = await prisma.user.findMany({ take: 3 });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n--- LEADS ---');
  const leads = await prisma.lead.findMany({ 
    take: 5,
    include: {
      assignedTo: { select: { name: true } },
      sources: { select: { source: true } }
    }
  });
  console.log(JSON.stringify(leads, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
