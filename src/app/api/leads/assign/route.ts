// SimpleCRM — api/leads/assign/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { bulkAssignSchema } from "@/modules/leads/leads.schema";
import { bulkAssignLeads } from "@/modules/leads/leads.service";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rawBody = await req.json();
    const parsed = bulkAssignSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { count } = await bulkAssignLeads(
      parsed.data.leadIds,
      parsed.data.assignedToId,
      session.userId
    );

    return NextResponse.json({ assigned: count });
  } catch (error) {
    return NextResponse.json({ error: "Failed to bulk assign leads" }, { status: 500 });
  }
}
