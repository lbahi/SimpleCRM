// SimpleCRM — settings reset api
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Delete all lead sources, leads, capture forms, and team members (except current admin) in a safe database transaction
    await prisma.$transaction([
      prisma.leadSource.deleteMany(),
      prisma.lead.deleteMany(),
      prisma.captureForm.deleteMany(),
      prisma.user.deleteMany({
        where: {
          id: { not: session.userId },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Workspace reset successful" });
  } catch (error) {
    console.error("Failed to reset workspace:", error);
    return NextResponse.json({ error: "Failed to reset workspace" }, { status: 500 });
  }
}
