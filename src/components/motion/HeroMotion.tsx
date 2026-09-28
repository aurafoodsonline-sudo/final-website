"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Hero stage: the banner image slowly zooms out and drifts as you scroll, while the
 * copy floats up and fades — a cinematic parallax exit into the page.
 */
export default function HeroMotion({ image, children, className = "" }: { image: ReactNode; children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      tl.fromTo("[data-hero-img]", { scale: 1.12, yPercent: 0 }, { scale: 1, yPercent: 8, ease: "none" }, 0)
        .to("[data-hero-copy]", { yPercent: -35, autoAlpha: 0, ease: "none" }, 0);

      // Intro: image settles in on load.
      gsap.from("[data-hero-img]", { autoAlpha: 0, duration: 1.4, ease: "power2.out" });
    },
    { scope: root },
  );

  return (
    <div ref={root} data-no-reveal className={className}>
      <div data-hero-img className="absolute inset-0 will-change-transform">{image}</div>
      <div data-hero-copy className="absolute inset-0">{children}</div>
    </div>
  );
}
