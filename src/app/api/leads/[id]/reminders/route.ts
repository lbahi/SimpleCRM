// SimpleCRM — api/leads/[id]/reminders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  try {
    const reminders = await prisma.reminder.findMany({
      where: { 
        leadId: params.id,
        status: status as any
      },
      orderBy: { dueAt: "asc" },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}
