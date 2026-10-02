import { NextRequest, NextResponse } from "next/server";
import { getPublicOrigin, getRefererPath } from "@/lib/request-origin";
import { saveMessage } from "@/lib/messages";

// Saves the form in the database (Admin → Messages) and returns the visitor to the form.
export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const ok = await saveMessage("support", fd);
  const destination = getRefererPath(req, "/en/support");
  return NextResponse.redirect(new URL(`${destination}?${ok ? "sent=1" : "error=1"}`, getPublicOrigin(req)), 303);
}
