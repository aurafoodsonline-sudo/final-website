import { NextRequest, NextResponse } from "next/server";
import { getPublicOrigin, getRefererPath } from "@/lib/request-origin";

export async function POST(req: NextRequest) {
  // Tickets are logged on the server for now (no helpdesk is connected yet).
  const fd = await req.formData();
  console.log("Support ticket:", Object.fromEntries(fd));
  const destination = getRefererPath(req, "/en/support");
  return NextResponse.redirect(new URL(`${destination}?sent=1`, getPublicOrigin(req)), 303);
}
