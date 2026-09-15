// SimpleCRM — api/notifications/read-all/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/notifications/read-all
// Marks all of the current user's unread notifications as read.
export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { count } = await prisma.notification.updateMany({
      where: { recipientId: session.userId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ updated: count });
  } catch {
    return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
  }
}
