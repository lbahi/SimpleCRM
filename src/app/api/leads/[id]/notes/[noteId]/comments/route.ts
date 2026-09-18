// SimpleCRM — api/leads/[id]/notes/[noteId]/comments/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { NotificationType } from "@prisma/client";

const commentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000)
    .refine((v) => v.trim().length > 0, "Comment cannot be whitespace only"),
});

type Params = { params: Promise<{ id: string; noteId: string }> };

async function assertLeadAccess(
  leadId: string,
  session: { userId: string; role: string }
) {
  if (session.role === "ADMIN") return true;
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { assignedToId: true },
  });
  return lead?.assignedToId === session.userId;
}

// GET /api/leads/[id]/notes/[noteId]/comments
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: leadId, noteId } = await params;
  if (!(await assertLeadAccess(leadId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Verify note exists and belongs to the lead
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { leadId: true },
    });
    if (!note || note.leadId !== leadId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const comments = await prisma.noteComment.findMany({
      where: { noteId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, avatarInitials: true } },
      },
    });
    return NextResponse.json({ comments, currentUserId: session.userId });
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/leads/[id]/notes/[noteId]/comments
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: leadId, noteId } = await params;
  if (!(await assertLeadAccess(leadId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawBody = await req.json();
  const parsed = commentSchema.safeParse({ body: rawBody.body });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Verify note exists and belongs to the lead
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, authorId: true, leadId: true },
    });
    if (!note || note.leadId !== leadId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Fetch current user's name for the notification message
    const actor = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });

    const comment = await prisma.noteComment.create({
      data: {
        body: parsed.data.body.trim(),
        noteId,
        authorId: session.userId,
      },
      include: {
        author: { select: { id: true, name: true, avatarInitials: true } },
      },
    });

    // Only notify if commenter is different from note owner
    if (session.userId !== note.authorId) {
      await prisma.notification.create({
        data: {
          type: NotificationType.NOTE_COMMENT_REPLY,
          recipientId: note.authorId,
          actorId: session.userId,
          leadId,
          noteId,
          message: `${actor?.name ?? "Someone"} replied to your note`,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

// PATCH /api/leads/[id]/notes/[noteId]/comments  — edit own comment
const patchSchema = z.object({
  commentId: z.string().min(1),
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000)
    .refine((v) => v.trim().length > 0, "Comment cannot be whitespace only"),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: leadId, noteId } = await params;
  if (!(await assertLeadAccess(leadId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawBody = await req.json();
  const parsed = patchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Verify note belongs to the lead
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { leadId: true },
    });
    if (!note || note.leadId !== leadId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Verify comment exists and belongs to current user
    const existing = await prisma.noteComment.findUnique({
      where: { id: parsed.data.commentId },
      select: { authorId: true, noteId: true },
    });
    if (!existing || existing.noteId !== noteId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (existing.authorId !== session.userId) {
      return NextResponse.json({ error: "You can only edit your own comments" }, { status: 403 });
    }

    const updated = await prisma.noteComment.update({
      where: { id: parsed.data.commentId },
      data: { body: parsed.data.body.trim() },
      include: {
        author: { select: { id: true, name: true, avatarInitials: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}
