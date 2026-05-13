// SimpleCRM — users.schema.ts
import { z } from "zod";
import { Role } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const inviteMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  avatarInitials: z.string().length(2, "Initials must be 2 characters").toUpperCase(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatarInitials: z.string().length(2).optional(),
});

export const deactivateMemberSchema = z.object({
  reassignToId: z.string().nullable(),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type DeactivateMemberInput = z.infer<typeof deactivateMemberSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
