// SimpleCRM — api/users/[id]/reactivate/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { reactivateMember } from "@/modules/users/users.service";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const user = await reactivateMember(id);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to reactivate member" }, { status: 500 });
  }
}
