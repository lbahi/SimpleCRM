// SimpleCRM — api/inbox/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listUnassignedLeads } from "@/modules/leads/leads-interactions.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const leads = await listUnassignedLeads();
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inbox leads" }, { status: 500 });
  }
}
