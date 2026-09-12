import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authCookie, createAdminToken } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

function matches(candidate: string, expected: string) {
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(`login:${ip}`)) {
    return NextResponse.json({ message: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Please enter a valid email and password." }, { status: 400 });
  }

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json({ message: "Administrator login is not configured." }, { status: 503 });
  }
  if (!matches(parsed.data.email.toLowerCase(), expectedEmail.toLowerCase()) || !matches(parsed.data.password, expectedPassword)) {
    return NextResponse.json({ message: "That email or password is not recognised." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookie.name, await createAdminToken(expectedEmail), authCookie.options);
  return response;
}
