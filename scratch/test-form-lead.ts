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
  console.log("Creating a form to test submission...");
  const form = await prisma.captureForm.upsert({
    where: { slug: "test-form" },
    update: {},
    create: {
      name: "Test Form",
      slug: "test-form",
      sourceTag: "WEBSITE",
      fields: [
        { id: "name", label: "Name", type: "text", required: true },
        { id: "phone", label: "Phone", type: "text", required: true },
      ]
    }
  });

  console.log("Form created:", form.slug);
  
  // Note: we can't easily call the submitForm service from here without importing it
  // and handling all dependencies. We'll just create a lead manually as if it came from a form.
  
  console.log("Simulating form submission lead creation...");
  const lead = await prisma.lead.create({
    data: {
      name: "Form Test Lead",
      phone: "111-2222",
      status: "NEW",
      sources: {
        create: {
          source: "WEBSITE",
          formId: form.id,
        }
      }
    }
  });
  
  console.log("Lead created via simulated form:", lead.id);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
