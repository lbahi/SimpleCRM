// SimpleCRM — prisma seed
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";
import { LeadStatus } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  // ── Delete all existing data except admin ───────────────────────────
  console.log("🗑️  Cleaning existing data...");
  
  // Delete all leads
  await prisma.lead.deleteMany({});
  console.log("✅ Deleted all leads");
  
  // Delete all members (keep only admin)
  await prisma.user.deleteMany({
    where: {
      role: "MEMBER"
    }
  });
  console.log("✅ Deleted all members");

  // ── Create admin user ───────────────────────────

  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@simplecrm.com" },
    update: { passwordHash: adminPassword, isActive: true },
    create: {
      name: "Admin",
      email: "admin@simplecrm.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      avatarInitials: "AD",
    },
  });
  console.log(`✅ ${admin.email}`);

  // ── Create representative dummy members ───────────────────

  const member1Password = await hashPassword("member123");
  const member1 = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "john.smith@simplecrm.com",
      passwordHash: member1Password,
      role: "MEMBER",
      avatarInitials: "JS",
    },
  });
  console.log(`✅ ${member1.email}`);

  const member2Password = await hashPassword("member123");
  const member2 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah.johnson@simplecrm.com",
      passwordHash: member2Password,
      role: "MEMBER",
      avatarInitials: "SJ",
    },
  });
  console.log(`✅ ${member2.email}`);

  const member3Password = await hashPassword("member123");
  const member3 = await prisma.user.create({
    data: {
      name: "Michael Brown",
      email: "michael.brown@simplecrm.com",
      passwordHash: member3Password,
      role: "MEMBER",
      avatarInitials: "MB",
    },
  });
  console.log(`✅ ${member3.email}`);

  // ── Create representative dummy leads ───────────────────

  const leads = [
    {
      name: "TechCorp Enterprise",
      phone: "+1-555-0101",
      location: "San Francisco, CA",
      status: LeadStatus.NO_RESPOND,
      rating: 3,
      assignedToId: member1.id,
    },
    {
      name: "Global Solutions Inc",
      phone: "+1-555-0102",
      location: "New York, NY",
      status: LeadStatus.CONTACTED,
      rating: 4,
      assignedToId: member2.id,
    },
    {
      name: "InnovateTech Ltd",
      phone: "+1-555-0103",
      location: "Austin, TX",
      status: LeadStatus.CONTACTED,
      rating: 3,
      assignedToId: member3.id,
    },
    {
      name: "Digital Dynamics",
      phone: "+1-555-0104",
      location: "Seattle, WA",
      status: LeadStatus.CONVERTED,
      rating: 5,
      assignedToId: member1.id,
    },
    {
      name: "CloudFirst Systems",
      phone: "+1-555-0105",
      location: "Denver, CO",
      status: LeadStatus.CONVERTED,
      rating: 5,
      assignedToId: member2.id,
    },
    {
      name: "FutureTech Ventures",
      phone: "+1-555-0106",
      location: "Boston, MA",
      status: LeadStatus.CONTACTED,
      rating: 4,
      assignedToId: member3.id,
    },
    {
      name: "DataDriven Corp",
      phone: "+1-555-0107",
      location: "Chicago, IL",
      status: LeadStatus.NO_RESPOND,
      rating: 2,
      assignedToId: member1.id,
    },
    {
      name: "SmartScale Solutions",
      phone: "+1-555-0108",
      location: "Los Angeles, CA",
      status: LeadStatus.CONTACTED,
      rating: 3,
      assignedToId: member2.id,
    },
    {
      name: "CloudNative Inc",
      phone: "+1-555-0109",
      location: "Miami, FL",
      status: LeadStatus.LOST,
      rating: 1,
      assignedToId: member3.id,
    },
    {
      name: "AIFirst Technologies",
      phone: "+1-555-0110",
      location: "Portland, OR",
      status: LeadStatus.CONTACTED,
      rating: 4,
      assignedToId: member1.id,
    },
  ];

  for (const lead of leads) {
    await prisma.lead.create({
      data: lead,
    });
    console.log(`✅ Created lead: ${lead.name}`);
  }

  // ── Create AppSettings singleton ───────────────────
  console.log("⚙️  Creating AppSettings singleton...");
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });
  console.log("✅ AppSettings singleton created/updated");

  console.log("\n🎉 Seed complete!");
  console.log("   admin@simplecrm.com / admin123");
  console.log("   john.smith@simplecrm.com / member123");
  console.log("   sarah.johnson@simplecrm.com / member123");
  console.log("   michael.brown@simplecrm.com / member123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
