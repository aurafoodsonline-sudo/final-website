"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type BrowserNavigation = {
  currentEntry?: { index: number };
  entries: () => { url?: string }[];
};

function isAdmin(url: URL) {
  return url.origin === window.location.origin &&
    (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) &&
    url.pathname !== "/admin/login";
}

export default function AdminBack() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const router = useRouter();
  const previous = useRef("");
  const popped = useRef(false);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const href = window.location.href;
    const state = window.history.state;
    if (!popped.current && previous.current && previous.current !== href && state?.adminBack?.href !== href) {
      window.history.replaceState({ ...state, adminBack: { href } }, "");
    }
    popped.current = false;
    previous.current = href;
  }, [pathname, query]);

  function goBack() {
    const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation;
    const index = navigation?.currentEntry?.index;
    const prior = index === undefined ? undefined : navigation?.entries()[index - 1]?.url;
    const referrer = document.referrer;
    const fromAdmin = prior
      ? isAdmin(new URL(prior))
      : index === undefined && (window.history.state?.adminBack?.href === window.location.href ||
        (window.history.length > 1 && referrer && isAdmin(new URL(referrer))));
    if (fromAdmin) {
      router.back();
      return;
    }
    const section = pathname.split("/").slice(0, 3).join("/");
    router.push(section !== pathname && /^\/admin\/(orders|products)$/.test(section) ? section : "/admin");
  }

  if (pathname === "/admin") return null;

  return (
    <button type="button" onClick={goBack} className="mb-4 text-sm underline print:hidden">
      ← Back
    </button>
  );
}
