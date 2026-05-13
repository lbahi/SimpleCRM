import { prisma } from "@/lib/prisma";
import { logActivity } from "../activity/activity.service";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

export const sendMessageSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Body is required"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Get unread inbox count for the user's assigned leads
export async function getInboxCount(userId: string, role: "ADMIN" | "MEMBER"): Promise<number> {
  if (!userId) return 0;
  try {
    const whereClause: any = {
      direction: "INBOUND",
      isRead: false,
    };

    if (role !== "ADMIN") {
      whereClause.lead = { assignedToId: userId };
    }

    return prisma.emailMessage.count({
      where: whereClause,
    });
  } catch (error) {
    console.error(`Error fetching inbox count for user ${userId}:`, error);
    return 0;
  }
}

// List all messages (inbox view)
export async function listInboxMessages(userId: string, role: "ADMIN" | "MEMBER") {
  const whereClause: any = {
    direction: "INBOUND",
  };

  if (role !== "ADMIN") {
    whereClause.lead = { assignedToId: userId };
  }

  return prisma.emailMessage.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      lead: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

// Get email thread for a specific lead
export async function getLeadMessages(leadId: string) {
  return prisma.emailMessage.findMany({
    where: { leadId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true },
      },
    },
  });
}

// Mark an email as read
export async function markEmailRead(messageId: string) {
  return prisma.emailMessage.update({
    where: { id: messageId },
    data: { isRead: true },
  });
}
export async function sendOutboundEmail(leadId: string, senderId: string, input: SendMessageInput) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) throw new Error("Lead not found");
  if (!lead.email) throw new Error("Lead has no email address");

  // Create the record in DB
  const message = await prisma.emailMessage.create({
    data: {
      leadId,
      senderId,
      subject: input.subject,
      body: input.body,
      direction: "OUTBOUND",
      isRead: true, // Outbound emails are "read" by default
    },
  });

  // Call the mock email service
  await sendEmail({
    to: lead.email,
    subject: input.subject,
    body: input.body,
  });

  // Log activity
  await logActivity({
    leadId,
    actorId: senderId,
    action: "CONTACTED",
    toValue: `Sent email: ${input.subject}`,
  });

  return message;
}


// Mock webhook to receive an email
export async function receiveInboundEmail(leadId: string, subject: string, body: string) {
  const message = await prisma.emailMessage.create({
    data: {
      leadId,
      subject,
      body,
      direction: "INBOUND",
      isRead: false,
    },
  });

  await logActivity({
    leadId,
    action: "CONTACTED", // Better if we had INBOUND_EMAIL
    toValue: `Received email: ${subject}`,
  });

  return message;
}
