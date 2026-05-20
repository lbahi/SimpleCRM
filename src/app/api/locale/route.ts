import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "fr", "ar"];

export async function POST(req: NextRequest) {
  try {
    const { locale } = await req.json();
    if (!locales.includes(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    
    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });

    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
    
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to set locale" }, { status: 400 });
  }
}
