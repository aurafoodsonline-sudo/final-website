"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Thin chili-to-turmeric bar across the top of the page showing reading progress. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!bar.current || prefersReducedMotion()) return;
    gsap.fromTo(
      bar.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 },
      },
    );
  });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-chili via-turmeric to-cardamom rtl:origin-right"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
