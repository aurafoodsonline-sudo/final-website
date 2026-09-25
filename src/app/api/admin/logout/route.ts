import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/request-origin";

export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/admin/login", getPublicOrigin(req)), 303);
}
