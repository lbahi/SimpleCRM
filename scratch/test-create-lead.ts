import "dotenv/config";
import { createLead } from "../src/modules/leads/leads.service";
import { prisma } from "../src/lib/prisma";

async function test() {
  console.log("Testing createLead...");
  try {
    // Find the admin user first
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.error("Admin user not found. Please seed the DB.");
      return;
    }

    const lead = await createLead({
      name: "Scratch Test Lead",
      phone: "555-9999",
      email: "scratch@test.com",
      source: "WEBSITE",
      status: "NEW",
      tags: []
    }, admin.id);

    console.log("SUCCESS! Lead ID:", lead.id);
  } catch (error) {
    console.error("FAILURE:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
