// SimpleCRM — api/reminders/count/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { countOverdueReminders } from "@/modules/reminders/reminders.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const count = await countOverdueReminders(session.userId, session.role as "ADMIN" | "MEMBER");
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reminder count" }, { status: 500 });
  }
}
