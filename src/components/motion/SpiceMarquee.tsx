"use client";

import ScrollVelocity from "@/components/reactbits/ScrollVelocity";
import type { Lang } from "@/lib/constants";

/**
 * Two ribbons of spice names that drift in opposite directions and speed up with the
 * scroll (React Bits ScrollVelocity). Always laid out LTR so the loop math works,
 * while Urdu words keep their own RTL shaping.
 */
export default function SpiceMarquee({ names, lang }: { names: string[]; lang: Lang }) {
  if (!names.length) return null;
  const ur = lang === "ur";
  const sep = "  ✦  ";
  const rowA = names.join(sep) + sep;
  const rowB = [...names].reverse().join(sep) + sep;
  return (
    <div
      dir="ltr"
      aria-hidden="true"
      data-no-reveal
      className="relative overflow-hidden border-y border-cinnamon/10 bg-cinnamon py-4 md:py-6 text-cream select-none"
    >
      <ScrollVelocity
        texts={[
          <span key="a" dir={ur ? "rtl" : "ltr"} className="text-turmeric">{rowA}</span>,
          <span key="b" dir={ur ? "rtl" : "ltr"} className="text-cream/90">{rowB}</span>,
        ]}
        velocity={40}
        numCopies={4}
        className={ur ? "font-urheritage" : "font-heritage italic"}
        scrollerStyle={{
          fontSize: "clamp(1.6rem, 4.2vw, 3.6rem)",
          lineHeight: ur ? 2.1 : 1.25,
          fontWeight: 600,
          letterSpacing: ur ? 0 : "-0.01em",
          textShadow: "none",
          filter: "none",
        }}
      />
    </div>
  );
}
