// SimpleCRM — api/reminders/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ActivityAction } from "@prisma/client";
import { reminderSchema } from "@/modules/reminders/reminders.schema";
import { listReminders } from "@/modules/reminders/reminders.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reminders = await listReminders(session.userId, session.role as "ADMIN" | "MEMBER");
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rawBody = await req.json();
    const parsed = reminderSchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    const dueDate = new Date(parsed.data.dueAt);
    if (dueDate <= new Date()) {
      return NextResponse.json(
        { error: "Reminder must be set in the future" },
        { status: 400 }
      );
    }

    const { leadId, dueAt, note } = parsed.data;

    const reminder = await prisma.reminder.create({
      data: {
        leadId,
        dueAt: new Date(dueAt),
        note: note || null,
        status: "PENDING",
        createdById: session.userId,
      },
    });

    const formattedDate = new Date(dueAt).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    await prisma.activityLog.create({
      data: {
        action: ActivityAction.REMINDER_SET,
        toValue: formattedDate,
        leadId,
        actorId: session.userId,
      },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
