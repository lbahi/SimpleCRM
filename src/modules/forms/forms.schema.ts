// SimpleCRM — forms.schema.ts
import { z } from "zod";
import { Source } from "@prisma/client";

export const createFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  sourceTag: z.nativeEnum(Source),
  fields: z.object({
    location: z.boolean(),
    message: z.boolean(),
  }),
});

export const updateFormSchema = createFormSchema.partial().extend({
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
