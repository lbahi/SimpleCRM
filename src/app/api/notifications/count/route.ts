// SimpleCRM — api/notifications/count/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/notifications/count
// Returns the number of unread notifications for the current user.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const count = await prisma.notification.count({
      where: { recipientId: session.userId, read: false },
    });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}
