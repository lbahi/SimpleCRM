// SimpleCRM — api/leads/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Update each lead's order in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lead.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder leads" }, { status: 500 });
  }
}
