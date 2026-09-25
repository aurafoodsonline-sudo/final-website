"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Shows the green "saved" / red "please fix" message that admin forms send back after saving.
export default function FlashMessage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");
  const error = params.get("error");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (!ok) return;
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [ok, error]);

  if (!visible || (!ok && !error)) return null;

  const dismiss = () => {
    setVisible(false);
    const rest = new URLSearchParams(params.toString());
    rest.delete("ok");
    rest.delete("error");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div role={error ? "alert" : "status"} className={`mb-4 flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm shadow-sm ${error ? "bg-chili/10 text-chili border border-chili/30" : "bg-cardamom/15 text-cardamom border border-cardamom/30"}`}>
      <span>{error ? `⚠ ${error}` : `✓ ${ok}`}</span>
      <button type="button" onClick={dismiss} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Dismiss">✕</button>
    </div>
  );
}
