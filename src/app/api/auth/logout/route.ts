import { NextResponse } from "next/server";
import { clearSession, SESSION_COOKIE } from "@/lib/session";

const isProd = process.env.NODE_ENV === "production";

export async function POST() {
  await clearSession();

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.delete(SESSION_COOKIE);

  if (!isProd) {
    response.cookies.set("__Host-simplecrm_session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    response.cookies.delete("__Host-simplecrm_session");
  } else {
    response.cookies.delete("simplecrm_session");
  }

  return response;
}

