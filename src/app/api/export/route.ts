import { NextResponse } from "next/server";

// GET /api/export — CSV export (admin only)
export async function GET() {
  // TODO: implement CSV generation with papaparse
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
