// SimpleCRM — GET /api/leads + POST /api/leads
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { listLeadsSchema, createLeadSchema } from "@/modules/leads/leads.schema";
import { listLeads, createLead } from "@/modules/leads/leads.service";

// GET /api/leads — list with filters + role scoping
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const raw = {
    ...Object.fromEntries(searchParams.entries()),
    // Inject session context server-side — never trusted from client
    userId: session.userId,
    role: session.role,
  };

  const parsed = listLeadsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await listLeads(parsed.data);
  return NextResponse.json(result);
}

// POST /api/leads — create
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const lead = await createLead(parsed.data, session.userId);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
