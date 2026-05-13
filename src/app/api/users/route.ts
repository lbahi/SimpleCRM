// SimpleCRM — api/users/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { listMembers, inviteMember, listUsers } from "@/modules/users/users.service";
import { inviteMemberSchema } from "@/modules/users/users.schema";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role | null;

  try {
    // If Admin and no role filter, return full member stats for dashboard
    if (session.role === Role.ADMIN && !role) {
      const members = await listMembers();
      return NextResponse.json(members);
    }

    // Otherwise return basic user list (for picker etc)
    const users = await listUsers(role || undefined);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== Role.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = inviteMemberSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await inviteMember(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to invite member";
    if (message === "Email already in use") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
