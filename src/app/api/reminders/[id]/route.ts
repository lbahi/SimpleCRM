// SimpleCRM — api/reminders/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { patchReminderSchema } from "@/modules/reminders/reminders.schema";
import { dismissReminder, rescheduleReminder } from "@/modules/reminders/reminders.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const rawBody = await req.json();
    const parsed = patchReminderSchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    const payload = parsed.data;

    if (payload.action === "dismiss") {
      const reminder = await dismissReminder(id, session.userId);
      return NextResponse.json(reminder);
    } 
    
    if (payload.action === "reschedule") {
      const reminder = await rescheduleReminder(
        id, 
        new Date(payload.dueAt), 
        payload.note, 
        session.userId
      );
      return NextResponse.json(reminder);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
