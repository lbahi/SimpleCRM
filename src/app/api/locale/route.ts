import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { locale } = await req.json();
    const response = NextResponse.json({ success: true });
    
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: "lax",
    });
    
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to set locale" }, { status: 400 });
  }
}
