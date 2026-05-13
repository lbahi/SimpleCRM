// SimpleCRM — api/users/[id]/deactivate/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { deactivateMember } from "@/modules/users/users.service";
import { deactivateMemberSchema } from "@/modules/users/users.schema";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot deactivate yourself" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = deactivateMemberSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await deactivateMember(id, parsed.data.reassignToId, session.userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to deactivate member" }, { status: 500 });
  }
}
