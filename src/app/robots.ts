import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ["*", "OAI-SearchBot"].map((userAgent) => ({ userAgent, allow: "/", disallow: ["/admin", "/api"] })),
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
