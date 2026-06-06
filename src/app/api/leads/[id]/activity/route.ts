// SimpleCRM — api/leads/[id]/activity/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ActivityAction } from "@prisma/client";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_ACTIONS = new Set<string>(Object.values(ActivityAction));

const activitySchema = z.object({
  action: z.string().refine((v) => ALLOWED_ACTIONS.has(v), "Unknown action"),
  fromValue: z.string().max(500).optional(),
  toValue: z.string().max(500).optional(),
});

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.role !== "ADMIN") {
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { assignedToId: true },
    });
    if (!lead || lead.assignedToId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const activityLogs = await prisma.activityLog.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: { id: true, name: true, avatarInitials: true },
        },
      },
    });
    return NextResponse.json(activityLogs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = activitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (session.role !== "ADMIN") {
      const lead = await prisma.lead.findUnique({
        where: { id },
        select: { assignedToId: true },
      });
      if (!lead || lead.assignedToId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        action: parsed.data.action as ActivityAction,
        fromValue: parsed.data.fromValue,
        toValue: parsed.data.toValue,
        leadId: id,
        actorId: session.userId,
      },
      include: {
        actor: {
          select: { id: true, name: true, avatarInitials: true },
        },
      },
    });

    return NextResponse.json(activityLog);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity log" }, { status: 500 });
  }
}
