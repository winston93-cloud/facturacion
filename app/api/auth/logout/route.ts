import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/jwt";

// 2026-04-28: CIerra sesión eliminando cookie httpOnly firmada.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const to = new URL("/login", url.origin);
  const res = NextResponse.redirect(to);
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
