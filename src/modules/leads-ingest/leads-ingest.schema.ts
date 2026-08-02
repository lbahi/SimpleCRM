// SimpleCRM — leads-ingest.schema.ts
import { z } from "zod";

export const ingestLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().optional(),
  rating: z.number().min(0).max(5).optional().default(0),
  customFields: z.record(z.string(), z.unknown()).optional(),
  source: z.string().min(1, "Source is required"),
  externalConversationId: z.string().min(1, "External conversation ID is required"),
  leadId: z.string().optional(),
});

export type IngestLeadInput = z.infer<typeof ingestLeadSchema>;
