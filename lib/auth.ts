import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const cookieName = "forgeworks_admin";
const encoder = new TextEncoder();

function secret() {
  return encoder.encode(
    process.env.JWT_SECRET || "development-only-change-this-jwt-secret-before-deploying",
  );
}

export type AdminSession = { email: string; role: "admin" };

export async function createAdminToken(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { email: payload.sub, role: "admin" };
  } catch {
    return null;
  }
}

export const authCookie = {
  name: cookieName,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  },
};
