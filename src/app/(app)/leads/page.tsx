// SimpleCRM — leads page (server) with Figma design
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { adaptPrismaLeadsToFigma } from "@/lib/adapters/leads.adapter";
import { LeadsClient } from "./figma-design/components/leads-client";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch leads with relations from Prisma
  const prismaLeads = await prisma.lead.findMany({
    include: {
      assignedTo: true,
      sources: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert to Figma format
  const initialLeads = adaptPrismaLeadsToFigma(prismaLeads);

  return <LeadsClient initialLeads={initialLeads} />;
}
