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
  const url = new URL(req.url);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/admin/login?error=1", url.origin));
  }
  await createSession(user.id, user.username);
  return NextResponse.redirect(new URL("/admin", url.origin));
}
