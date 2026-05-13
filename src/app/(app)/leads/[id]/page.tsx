import { notFound } from "next/navigation";
import { getLeadById } from "@/modules/leads/leads.service";
import { LeadDetailClient } from "./lead-detail-client";

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return <LeadDetailClient initialLead={lead} />;
}
