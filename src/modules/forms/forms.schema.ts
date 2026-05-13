// SimpleCRM — forms.schema.ts
import { z } from "zod";

export const createFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional().default("Submit your information below"),
  submitButtonText: z.string().optional().default("Send Request"),
  sourceTag: z.string().default("Website"),
  fields: z.any(),
});

export const updateFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  submitButtonText: z.string().optional(),
  sourceTag: z.string().optional(),
  fields: z.any().optional(),
  isActive: z.boolean().optional(),
});

export const submitFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Valid phone number required"),
  location: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;
