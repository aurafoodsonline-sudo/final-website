import { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/constants";

// Works out the address the visitor actually used (behind a proxy, on localhost, or on the live
// domain) so redirects after a form submit never send people to a different site.
export function getPublicOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = forwardedHost || req.headers.get("host")?.trim();
  if (host) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/.test(host);
    const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const proto = forwardedProto || (isLocal ? "http" : req.nextUrl.protocol.replace(":", "") || "https");
    return `${proto}://${host}`;
  }
  return SITE_URL;
}

// Path (plus query) of the page that submitted a form, restricted to this site.
export function getRefererPath(req: NextRequest, fallback = "/en") {
  const referer = req.headers.get("referer");
  if (!referer) return fallback;
  try {
    const url = new URL(referer);
    return url.pathname.startsWith("/") ? url.pathname : fallback;
  } catch {
    return fallback;
  }
}
