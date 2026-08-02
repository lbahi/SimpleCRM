// SimpleCRM — integrations.service
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { IntegrationAgentPublic, IntegrationAgentRow } from "./integrations.types";
import type { UpdateIntegrationAgentInput } from "./integrations.schema";

export async function getIntegrationAgentByKey(
  key: string
): Promise<IntegrationAgentRow | null> {
  return prisma.integrationAgent.findUnique({ where: { key } });
}

export function toPublicShape(agent: IntegrationAgentRow): IntegrationAgentPublic {
  return {
    key: agent.key,
    label: agent.label,
    agentName: agent.agentName,
    businessName: agent.businessName,
    serviceDescription: agent.serviceDescription,
    requiredFields: agent.requiredFields as string[],
    niceToHaveFields: agent.niceToHaveFields as string[],
    toneInstructions: agent.toneInstructions,
    isActive: agent.isActive,
  };
}

export async function updateIntegrationAgent(
  key: string,
  data: UpdateIntegrationAgentInput
): Promise<IntegrationAgentRow> {
  const existing = await prisma.integrationAgent.findUnique({ where: { key } });
  if (!existing) throw new Error("Integration agent not found");

  return prisma.integrationAgent.update({
    where: { key },
    data: {
      agentName: data.agentName,
      businessName: data.businessName,
      serviceDescription: data.serviceDescription,
      toneInstructions: data.toneInstructions,
      requiredFields: data.requiredFields
        ? (data.requiredFields as Prisma.InputJsonValue)
        : undefined,
      niceToHaveFields: data.niceToHaveFields
        ? (data.niceToHaveFields as Prisma.InputJsonValue)
        : undefined,
      isActive: data.isActive,
    },
  });
}
