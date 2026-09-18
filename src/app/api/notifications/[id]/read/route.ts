// SimpleCRM — api/notifications/[id]/read/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/notifications/[id]/read
// Marks one notification as read. Verifies ownership before updating.
export async function PATCH(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { recipientId: true },
    });

    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (notification.recipientId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
