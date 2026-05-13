import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { markEmailRead } from "@/modules/inbox/inbox.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const message = await markEmailRead(id);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
