import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

// Prisma 7.x requires postgresql:// not postgres://
if (connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
  connectionString = connectionString.replace("postgres://", "postgresql://");
  console.error("[Reset] Converted URL scheme from postgres:// to postgresql://");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['info', 'warn', 'error'] });

async function main() {
  // List existing users
  const existingUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  
  console.log(`Found ${existingUsers.length} existing user(s):`);
  for (const user of existingUsers) {
    console.log(`  - ${user.email} (${user.name}, ${user.role})`);
  }

  // Delete all existing users
  if (existingUsers.length > 0) {
    console.log('\nDeleting all existing users...');
    await prisma.user.deleteMany({});
    console.log('All users deleted.');
  }

  // Create fresh admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@simplecrm.local';
  const hashedPassword = await hash(adminPassword, 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      avatarInitials: 'AD',
      isActive: true
    }
  });

  console.log('\n=== New Admin User Created ===');
  console.log(`Email:    ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Role:     ${admin.role}`);
  console.log('==============================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
