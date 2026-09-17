import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/admin/login", new URL(req.url).origin));
}
