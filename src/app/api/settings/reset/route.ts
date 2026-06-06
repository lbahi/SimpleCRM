// SimpleCRM — settings reset api
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const resetSchema = z.object({
  confirmation: z.literal("RESET_WORKSPACE"),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Confirmation phrase required", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.activityLog.deleteMany(),
      prisma.note.deleteMany(),
      prisma.reminder.deleteMany(),
      prisma.emailMessage.deleteMany(),
      prisma.leadSource.deleteMany(),
      prisma.lead.deleteMany(),
      prisma.captureForm.deleteMany(),
      prisma.user.deleteMany({
        where: { id: { not: session.userId } },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Workspace reset successful" });
  } catch (error) {
    console.error("Failed to reset workspace:", error);
    return NextResponse.json({ error: "Failed to reset workspace" }, { status: 500 });
  }
}
