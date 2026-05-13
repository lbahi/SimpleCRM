import { prisma } from "./src/lib/prisma";

async function clearLeads() {
  const count = await prisma.lead.count();
  console.log(`Current leads: ${count}`);
  await prisma.lead.deleteMany({});
  console.log("All leads deleted successfully.");
}

clearLeads();
