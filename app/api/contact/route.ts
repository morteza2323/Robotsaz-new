import { NextRequest, NextResponse } from "next/server";
import { allowRequest } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(`contact:${ip}`, 4, 10 * 60 * 1000)) {
    return NextResponse.json({ message: "Please wait a few minutes before sending another message." }, { status: 429 });
  }
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Please check the fields and try again." }, { status: 400 });

  // Connect an email provider (such as Resend or Postmark) here in production.
  return NextResponse.json({ ok: true, message: "Your message is on its way to our projects team." }, { status: 202 });
}
