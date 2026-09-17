import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  // In production this would email/notify the team; kept simple for now.
  const fd = await req.formData();
  console.log("Contact form submission:", Object.fromEntries(fd));
  const url = new URL(req.url);
  return NextResponse.redirect(new URL(req.headers.get("referer") ?? "/en", url.origin));
}
