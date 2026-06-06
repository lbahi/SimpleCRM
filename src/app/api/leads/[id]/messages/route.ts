import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getLeadMessages, sendOutboundEmail } from "@/modules/inbox/inbox.service";
import { sendMessageSchema } from "@/modules/inbox/inbox.service";

type Params = { params: Promise<{ id: string }> };

async function assertLeadAccess(leadId: string, session: { userId: string; role: string }) {
  if (session.role === "ADMIN") return true;
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { assignedToId: true },
  });
  return lead?.assignedToId === session.userId;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertLeadAccess(id, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const messages = await getLeadMessages(id);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await assertLeadAccess(id, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await sendOutboundEmail(id, session.userId, parsed.data);
    return NextResponse.json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
