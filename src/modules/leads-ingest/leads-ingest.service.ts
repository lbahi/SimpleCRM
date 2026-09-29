// SimpleCRM — leads-ingest.service.ts
import { prisma } from "@/lib/prisma";
import { sendMetaCapiEvent } from "@/lib/meta-capi";
import { LeadStatus, Prisma, Lead } from "@prisma/client";
import { IngestLeadInput } from "./leads-ingest.schema";

export interface IngestResponse {
  ok: boolean;
  leadId: string;
  isNew: boolean;
}

export async function ingestLead(data: IngestLeadInput): Promise<IngestResponse> {
  const {
    leadId,
    externalConversationId,
    source,
    name,
    phone,
    location,
    rating,
    customFields: providedCustomFields = {},
  } = data;

  const mergedCustomFieldsData: Record<string, unknown> = {
    ...providedCustomFields,
    externalConversationId,
    source,
  };

  let existingLead: Lead | null = null;

  if (leadId) {
    existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });
  }

  if (!existingLead && externalConversationId) {
    const rawMatches = await prisma.lead.findMany({
      where: {
        customFields: {
          path: ["externalConversationId"],
          equals: externalConversationId,
        },
      },
      take: 1,
    });
    if (rawMatches.length > 0) {
      existingLead = rawMatches[0];
    }
  }

  if (existingLead) {
    const existingCustomFields = (existingLead.customFields as Record<string, unknown> | null) || {};
    const updatedCustomFields: Record<string, unknown> = {
      ...existingCustomFields,
      ...mergedCustomFieldsData,
    };

    const updatedLead = await prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        name: name ?? existingLead.name,
        phone: phone ?? existingLead.phone,
        location: location !== undefined ? location : existingLead.location,
        rating: rating !== undefined ? rating : existingLead.rating,
        customFields: updatedCustomFields as Prisma.InputJsonValue,
      },
    });

    const hasSource = await prisma.leadSource.findFirst({
      where: {
        leadId: updatedLead.id,
        source: source,
      },
    });

    if (!hasSource) {
      await prisma.leadSource.create({
        data: {
          leadId: updatedLead.id,
          source: source,
        },
      });
    }

    return { ok: true, leadId: updatedLead.id, isNew: false };
  }

  let newLead: Lead | null = null;
  const result = await prisma.$transaction(async (tx) => {
    newLead = await tx.lead.create({
      data: {
        name,
        phone,
        location: location ?? null,
        rating: rating ?? 0,
        status: LeadStatus.NEW,
        assignedToId: null,
        customFields: mergedCustomFieldsData as Prisma.InputJsonValue,
        sources: {
          create: {
            source,
          },
        },
      },
    });

    return { ok: true, leadId: newLead.id, isNew: true };
  });

  // Fire-and-forget: CAPI failure must never block lead creation
  void sendMetaCapiEvent(
    { email: newLead!.email, phone: newLead!.phone, name: newLead!.name },
    "Lead"
  );

  return result;
}
