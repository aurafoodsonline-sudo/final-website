import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const fd = await req.formData();
  console.log("Support ticket:", Object.fromEntries(fd));
  const url = new URL(req.url);
  return NextResponse.redirect(new URL(req.headers.get("referer") ?? "/en", url.origin));
}
