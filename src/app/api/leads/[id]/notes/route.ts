// SimpleCRM — api/leads/[id]/notes/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSession } from "@/lib/session";

const noteSchema = z.object({
  body: z.string().min(1, "Note content is required"),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const notes = await prisma.note.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatarInitials: true },
        },
      },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const rawBody = await req.json();
    
    const parsed = noteSchema.safeParse({ body: rawBody.body || rawBody.content });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const content = parsed.data.body;

    const note = await prisma.note.create({
      data: {
        body: content,
        leadId: id,
        authorId: session.userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarInitials: true },
        },
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
