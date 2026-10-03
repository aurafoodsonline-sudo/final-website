import { NextRequest, NextResponse } from "next/server";

const LANGS = ["en", "ur"];
const PASSTHROUGH = ["admin", "api", "_next", "images", "uploads"];

// Keeps every storefront URL under /en or /ur so mistyped links (e.g. /shop) still work
// instead of showing a broken page.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/images/favicon.jpg", req.url));
  }
  if (pathname === "/") return NextResponse.redirect(new URL("/en", req.url));
  if (pathname.includes(".")) return NextResponse.next();

  const first = pathname.split("/")[1];
  if (LANGS.includes(first) || PASSTHROUGH.includes(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
