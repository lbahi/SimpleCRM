import { PrismaClient, Source } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- DATABASE PROBE START ---");
  try {
    const testForm = await prisma.captureForm.create({
      data: {
        name: "Direct Probe Form",
        description: "Testing if the DB accepts new columns",
        slug: "probe-" + Date.now(),
        sourceTag: Source.WEBSITE,
        submitButtonText: "Probe Submit",
        fields: [
          { id: 'name', type: 'text', label: 'Probe Name', required: true }
        ],
        isActive: true
      }
    });
    console.log("SUCCESS! Form created with ID:", testForm.id);
  } catch (error: any) {
    console.error("FAILED! Error details:");
    console.error("Message:", error.message);
    if (error.code) console.error("Prisma Error Code:", error.code);
  } finally {
    await prisma.$disconnect();
  }
  console.log("--- DATABASE PROBE END ---");
}

main();
