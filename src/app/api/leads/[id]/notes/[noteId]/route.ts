// SimpleCRM — api/leads/[id]/notes/[noteId]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSession } from "@/lib/session";

const notePatchSchema = z.object({
  body: z
    .string()
    .min(1, "Note cannot be empty")
    .max(5000)
    .refine((v) => v.trim().length > 0, "Note cannot be whitespace only"),
});

type Params = { params: Promise<{ id: string; noteId: string }> };

async function assertLeadAccess(leadId: string, session: { userId: string; role: string }) {
  if (session.role === "ADMIN") return true;
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { assignedToId: true },
  });
  return lead?.assignedToId === session.userId;
}

// PATCH /api/leads/[id]/notes/[noteId] — edit own note
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: leadId, noteId } = await params;
  if (!(await assertLeadAccess(leadId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawBody = await req.json();
  const parsed = notePatchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Verify note exists and belongs to the lead
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { leadId: true, authorId: true },
    });
    if (!note || note.leadId !== leadId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    if (note.authorId !== session.userId) {
      return NextResponse.json({ error: "You can only edit your own notes" }, { status: 403 });
    }

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: { body: parsed.data.body.trim() },
      include: {
        author: { select: { id: true, name: true, avatarInitials: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}