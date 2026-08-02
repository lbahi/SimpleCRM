// SimpleCRM — integrations.types
import type { IntegrationAgent } from "@prisma/client";

export type IntegrationAgentRow = IntegrationAgent;

export interface IntegrationAgentPublic {
  key: string;
  label: string;
  agentName: string;
  businessName: string;
  serviceDescription: string;
  requiredFields: string[];
  niceToHaveFields: string[];
  toneInstructions: string;
  isActive: boolean;
}
