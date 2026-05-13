// SimpleCRM — api/leads/[id]/activity/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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
    const { action, fromValue, toValue } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        action,
        fromValue,
        toValue,
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
