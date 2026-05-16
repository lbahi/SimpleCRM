import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { updateLeadSchema, assignLeadSchema } from "@/modules/leads/leads.schema";
import {
  getLeadById,
} from "@/modules/leads/leads.service";
import {
  updateLead,
  assignLead,
  deleteLead,
} from "@/modules/leads/leads-mutations.service";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(lead);
}

// PATCH /api/leads/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Support both update and assign payloads
  if ("assignedToId" in body) {
    const parsed = assignLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const lead = await assignLead(id, parsed.data);
    return NextResponse.json(lead);
  }

  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const lead = await updateLead(id, parsed.data);
  return NextResponse.json(lead);
}

// DELETE /api/leads/:id — admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (session.role !== "ADMIN") {
    const lead = await getLeadById(id);
    if (!lead || lead.assignedToId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await deleteLead(id);
  return new NextResponse(null, { status: 204 });
}
