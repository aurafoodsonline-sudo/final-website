"use client";
import { createContext, useContext } from "react";
import { DICT, type Dict, type Lang } from "@/lib/constants";
import type { SiteInfo } from "@/lib/site";

// Gives browser-side components the same database-driven wording and business details
// that the server used to render the page.
type SiteContextValue = { lang: Lang; dict: Dict; site: SiteInfo | null };
const SiteContext = createContext<SiteContextValue | null>(null);

export default function SiteProvider({ value, children }: { value: SiteContextValue; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useT(lang: Lang): Dict {
  const ctx = useContext(SiteContext);
  return ctx && ctx.lang === lang ? ctx.dict : DICT[lang];
}

export function useSite(): SiteInfo | null {
  return useContext(SiteContext)?.site ?? null;
}
