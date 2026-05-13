// SimpleCRM — users.service.ts
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth";
import { User, Role, LeadStatus, ActivityAction } from "@prisma/client";
import { SafeUser, MemberWithStats } from "./users.types";
import { InviteMemberInput, UpdateMemberInput } from "./users.schema";

const CLOSED_STATUSES: LeadStatus[] = [LeadStatus.CONVERTED, LeadStatus.LOST];

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export async function authenticate(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return null;

  return toSafeUser(user);
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toSafeUser(user) : null;
}

export async function listMembers(): Promise<MemberWithStats[]> {
  const members = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { assignedLeads: true } }
    }
  });

  // Fetch counts for open and closed leads per member
  const stats = await Promise.all(members.map(async (member) => {
    const [openCount, closedCount] = await Promise.all([
      prisma.lead.count({
        where: { assignedToId: member.id, status: { notIn: CLOSED_STATUSES } }
      }),
      prisma.lead.count({
        where: { assignedToId: member.id, status: { in: CLOSED_STATUSES } }
      })
    ]);

    return {
      ...toSafeUser(member),
      _count: member._count,
      openLeads: openCount,
      closedLeads: closedCount
    };
  }));

  return stats as MemberWithStats[];
}

export async function inviteMember(data: InviteMemberInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.MEMBER,
      avatarInitials: data.avatarInitials,
      isActive: true
    }
  });

  return toSafeUser(user);
}

export async function updateMember(id: string, data: UpdateMemberInput): Promise<SafeUser> {
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, id: { not: id } }
    });
    if (existing) throw new Error("Email already in use");
  }

  const user = await prisma.user.update({
    where: { id },
    data
  });

  return toSafeUser(user);
}

export async function deactivateMember(
  id: string, 
  reassignToId: string | null, 
  actorId: string
): Promise<{ deactivated: boolean; leadsReassigned: number; leadsReturnedToInbox: number }> {
  return prisma.$transaction(async (tx) => {
    // 1. Handle leads
    const openLeads = await tx.lead.findMany({
      where: { assignedToId: id, status: { notIn: CLOSED_STATUSES } },
      select: { id: true }
    });

    const leadIds = openLeads.map(l => l.id);

    if (leadIds.length > 0) {
      // Update leads
      await tx.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { assignedToId: reassignToId }
      });

      // Log activities
      await tx.activityLog.createMany({
        data: leadIds.map(leadId => ({
          action: ActivityAction.REASSIGNED,
          leadId,
          actorId,
          content: reassignToId ? "Lead reassigned due to member deactivation" : "Lead returned to inbox due to member deactivation"
        }))
      });
    }

    // 2. Deactivate user
    await tx.user.update({
      where: { id },
      data: { isActive: false }
    });

    return {
      deactivated: true,
      leadsReassigned: reassignToId ? leadIds.length : 0,
      leadsReturnedToInbox: reassignToId ? 0 : leadIds.length
    };
  });
}

export async function reactivateMember(id: string): Promise<SafeUser> {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true }
  });
  return toSafeUser(user);
}

// Keep generic listUsers for other parts of the app if needed
export async function listUsers(role?: Role): Promise<SafeUser[]> {
  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return users.map(toSafeUser);
}
