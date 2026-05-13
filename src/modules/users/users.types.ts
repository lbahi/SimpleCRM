// SimpleCRM — users.types.ts
import { User, LeadStatus } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

export type MemberWithStats = SafeUser & {
  _count: {
    assignedLeads: number;
  };
  openLeads: number;
  closedLeads: number;
};
