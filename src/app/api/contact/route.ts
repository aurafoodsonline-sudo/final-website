import { NextRequest, NextResponse } from "next/server";
import { getPublicOrigin, getRefererPath } from "@/lib/request-origin";

export async function POST(req: NextRequest) {
  // Messages are logged on the server for now (no email service is connected yet).
  const fd = await req.formData();
  console.log("Contact form submission:", Object.fromEntries(fd));
  const destination = getRefererPath(req, "/en/contact");
  return NextResponse.redirect(new URL(`${destination}?sent=1`, getPublicOrigin(req)), 303);
}
