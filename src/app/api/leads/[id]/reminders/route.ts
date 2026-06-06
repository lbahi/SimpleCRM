// SimpleCRM — api/leads/[id]/reminders/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ReminderStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = new Set<string>(Object.values(ReminderStatus));

export async function GET(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") || "PENDING";
  const status = ALLOWED_STATUSES.has(statusParam) ? statusParam : "PENDING";

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
    const reminders = await prisma.reminder.findMany({
      where: {
        leadId: id,
        status: status as ReminderStatus,
      },
      orderBy: { dueAt: "asc" },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}
