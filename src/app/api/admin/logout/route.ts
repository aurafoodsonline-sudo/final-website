import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  await destroySession();
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto.split(",")[0].trim()}://${forwardedHost.split(",")[0].trim()}`
    : new URL(req.url).origin;
  return NextResponse.redirect(new URL("/admin/login", origin));
}
