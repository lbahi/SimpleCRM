// SimpleCRM — api/users/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { updateMember } from "@/modules/users/users.service";
import { deleteMember } from "@/modules/users/users-delete.service";
import { updateMemberSchema } from "@/modules/users/users.schema";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await updateMember(id, parsed.data);
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update member";
    if (message === "Email already in use") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await deleteMember(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete member";
    if (message === "Deactivate this member before deleting." || message === "Already deleted" || message === "Reassign or return all open leads before deleting.") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message === "Member not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}