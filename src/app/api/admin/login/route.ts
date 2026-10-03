import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/request-origin";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const username = String(fd.get("username") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  const origin = getPublicOrigin(req);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/admin/login?error=1", origin), 303);
  }
  await createSession(user.id, user.username, origin.startsWith("https://"));
  return NextResponse.redirect(new URL("/admin", origin), 303);
}
