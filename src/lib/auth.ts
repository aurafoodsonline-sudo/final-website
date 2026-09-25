import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Set SESSION_SECRET in production (any long random string).
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "aura-foods-dev-secret-change-me");
const COOKIE = "aura_admin_session";
const SESSION_HOURS = 12;

export async function createSession(adminId: number, username: string, secure = false) {
  const token = await new SignJWT({ adminId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
    secure, // true only when the site is opened over https, so login also works on http/localhost
  });
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

// Used by every admin server action so nothing can be changed without being logged in.
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroySession() {
  const c = await cookies();
  c.delete(COOKIE);
}
