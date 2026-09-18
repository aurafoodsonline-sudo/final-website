import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const username = String(fd.get("username") ?? "");
  const password = String(fd.get("password") ?? "");
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto.split(",")[0].trim()}://${forwardedHost.split(",")[0].trim()}`
    : new URL(req.url).origin;
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/admin/login?error=1", origin));
  }
  await createSession(user.id, user.username);
  return NextResponse.redirect(new URL("/admin", origin));
}
