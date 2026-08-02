// SimpleCRM — integrations.schema
import { z } from "zod";

export const updateIntegrationAgentSchema = z.object({
  agentName: z.string().min(1).max(100).optional(),
  businessName: z.string().min(1).max(200).optional(),
  serviceDescription: z.string().min(1).optional(),
  toneInstructions: z.string().min(1).optional(),
  requiredFields: z.array(z.string()).optional(),
  niceToHaveFields: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateIntegrationAgentInput = z.infer<typeof updateIntegrationAgentSchema>;
