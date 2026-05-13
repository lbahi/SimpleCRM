import { prisma } from "../src/lib/prisma";
import { submitForm } from "../src/modules/forms/forms.service";

async function main() {
  const slug = "test-form"; // I need a valid slug
  console.log("Testing form submission for slug:", slug);
  
  try {
    // Let's create a form first if it doesn't exist
    let form = await prisma.captureForm.findUnique({ where: { slug } });
    if (!form) {
      console.log("Creating test form...");
      form = await prisma.captureForm.create({
        data: {
          name: "Test Form",
          slug,
          sourceTag: "WEBSITE",
          fields: [
            { id: "1", type: "TEXT", label: "Full Name", required: true },
            { id: "2", type: "PHONE", label: "Phone Number", required: true }
          ]
        }
      });
    }

    const data = {
      custom_1: "Test User",
      custom_2: "1234567890",
      message: "Hello world"
    };

    console.log("Submitting form...");
    const result = await submitForm(slug, data as any);
    console.log(`✅ Submission successful. Lead ID: ${result.leadId}`);
  } catch (error) {
    console.error("SUBMISSION FAILED:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
