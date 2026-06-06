// SimpleCRM — api/leads/reorder/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).max(1000),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = reorderSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { orderedIds } = parsed.data;

    if (session.role !== "ADMIN") {
      const owned = await prisma.lead.findMany({
        where: { id: { in: orderedIds } },
        select: { id: true, assignedToId: true },
      });
      const ownedIds = new Set(
        owned
          .filter((l) => l.assignedToId === session.userId)
          .map((l) => l.id)
      );
      if (ownedIds.size !== orderedIds.length) {
        return NextResponse.json(
          { error: "Forbidden: cannot reorder leads you do not own" },
          { status: 403 }
        );
      }
    }

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
