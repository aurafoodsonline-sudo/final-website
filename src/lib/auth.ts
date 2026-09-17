import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "aura-foods-dev-secret-change-me");
const COOKIE = "aura_admin_session";

export async function createSession(adminId: number, username: string) {
  const token = await new SignJWT({ adminId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(secret);
  const c = await cookies();
  c.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function getSession() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { adminId: number; username: string };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const c = await cookies();
  c.delete(COOKIE);
}
