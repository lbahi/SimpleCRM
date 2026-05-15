// SimpleCRM — api/inbox/count/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const count = await prisma.lead.count({ 
      where: { 
        assignedToId: null,
        NOT: { status: "CONVERTED" } // Checklist says "non-CLOSED", in our schema CONVERTED/LOST are the end states.
      } 
    });
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inbox count" }, { status: 500 });
  }
}
