import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient({ log: ['info', 'warn', 'error'] });

async function main() {
  const count = await prisma.user.count();
  if (count === 0) {
    const hashedPassword = await hash('password', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@simplecrm.local',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        avatarInitials: 'AD',
        isActive: true
      }
    });
    console.log('Admin created: admin@simplecrm.local / password');
  } else {
    console.log('Users already exist.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
