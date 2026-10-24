"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Scroll-triggered reveals for the whole storefront.
 *
 * AUTOMATIC MODE — anything inside a page's <main> animates on its own, with no extra code:
 *   h1, h2                     -> heading wipe-up
 *   grids (.grid / .flex-wrap) -> children appear one after another
 *   images                     -> gentle zoom-in
 *   h3, h4, p, lists, forms, tables, quotes, FAQ items -> fade + rise
 * So a new page, section, product, blog post or form gets the same effects automatically.
 * Opt out with data-no-reveal on an element (it and everything inside stays still).
 * The list of automatic targets lives in AUTO below and must match globals.css.
 *
 * MANUAL MODE — choose a specific effect with an attribute (this wins over automatic):
 *   data-reveal="up"       fade + rise
 *   data-reveal="fade"     fade only
 *   data-reveal="zoom"     fade + gentle scale
 *   data-reveal="clip"     image wipe (clip-path)
 *   data-reveal="stagger"  animates each direct child one after another (grids, lists)
 *   data-speed="0.15"      scrubbed parallax drift (positive = slower than the page)
 * Optional: data-reveal-delay="0.2"
 * Items hidden before JS (see globals.css) are revealed by this component; if JS never runs,
 * an inline script in the layout removes the hiding after a few seconds.
 */

const AUTO = "h1,h2,h3,h4,p,blockquote,figure,form,table,details,ul,ol,img,.grid,.flex-wrap";
const SKIP = "[data-reveal],[data-no-reveal],.split-parent";

/** Turn automatic targets into ordinary data-reveal elements (outermost first). */
function assignAuto() {
  document.querySelectorAll<HTMLElement>("main").forEach((main) => {
    main.querySelectorAll<HTMLElement>(AUTO).forEach((el) => {
      // Skip anything already handled, opted out, or inside something that animates as a whole.
      if (el.closest(SKIP)) return;
      let kind = "up";
      if (el.matches(".grid,.flex-wrap")) kind = el.children.length > 1 ? "stagger" : "up";
      else if (el.matches("h1,h2")) kind = "heading";
      else if (el.tagName === "IMG") kind = "zoom";
      el.dataset.reveal = kind;
      el.dataset.revealAuto = "1";
    });
  });
}

const FROM: Record<string, gsap.TweenVars> = {
  up: { autoAlpha: 0, y: 48 },
  fade: { autoAlpha: 0 },
  zoom: { autoAlpha: 0, scale: 0.94, y: 24 },
  clip: { autoAlpha: 1, clipPath: "inset(18% 12% 18% 12% round 2rem)", scale: 1.08 },
  heading: { autoAlpha: 0, y: 34, clipPath: "inset(0% 0% 100% 0%)" },
};
const TO: Record<string, gsap.TweenVars> = {
  up: { autoAlpha: 1, y: 0 },
  fade: { autoAlpha: 1 },
  zoom: { autoAlpha: 1, scale: 1, y: 0 },
  clip: { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0% round 1rem)", scale: 1 },
  heading: { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
};
const CLEAR = "transform,clipPath";

function revealOne(el: HTMLElement) {
  const kind = el.dataset.reveal ?? "up";
  const delay = parseFloat(el.dataset.revealDelay ?? "0") || 0;

  if (kind === "stagger") {
    const kids = Array.from(el.children).filter((c) => !(c as HTMLElement).dataset.revealChildDone) as HTMLElement[];
    kids.forEach((k) => (k.dataset.revealChildDone = "1"));
    if (!kids.length) return;
    // Container already on screen (e.g. a filter swapped the cards): animate right away.
    const alreadyShown = el.dataset.revealDone === "1";
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 40, scale: 0.97 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.09,
        delay,
        clearProps: "transform",
        scrollTrigger: alreadyShown ? undefined : { trigger: el, start: "top 88%", once: true },
      },
    );
    el.dataset.revealDone = "1";
    return;
  }

  if (el.dataset.revealDone) return;
  el.dataset.revealDone = "1";
  gsap.fromTo(el, FROM[kind] ?? FROM.up, {
    ...(TO[kind] ?? TO.up),
    duration: kind === "clip" ? 1.4 : kind === "heading" ? 1.1 : 0.95,
    ease: kind === "clip" ? "expo.out" : "power3.out",
    delay,
    clearProps: CLEAR,
    scrollTrigger: { trigger: el, start: "top 90%", once: true },
  });
}

function parallaxOne(el: HTMLElement) {
  if (el.dataset.speedDone) return;
  el.dataset.speedDone = "1";
  const speed = parseFloat(el.dataset.speed ?? "0.15");
  gsap.fromTo(
    el,
    { yPercent: -speed * 50 },
    {
      yPercent: speed * 50,
      ease: "none",
      scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}

/**
 * 3D scroll depth (GSAP ScrollTrigger, scrubbed to the scroll position):
 *   data-depth="card" (default) — the element tips toward the viewer as it scrolls in
 *   data-depth="fold"           — a whole section folds in from its top edge (wide screens only)
 * Every main > section gets "fold" automatically, unless it has data-no-depth.
 * Kept light on purpose: only transforms are animated, and the strongest effect is desktop-only.
 */
function depthOne(el: HTMLElement, kind: string = el.dataset.depth ?? "card") {
  if (el.dataset.depthDone) return;
  el.dataset.depthDone = "1";
  const wide = window.matchMedia("(min-width: 768px)").matches;

  if (kind === "fold") {
    if (!wide) return;
    gsap.fromTo(
      el,
      { rotateX: 7, transformPerspective: 1600, transformOrigin: "50% 0%" },
      { rotateX: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 100%", end: "top 30%", scrub: true } },
    );
    return;
  }

  gsap.fromTo(
    el,
    { rotateX: wide ? 18 : 10, rotateY: wide ? 8 : 4, transformPerspective: 1100, transformOrigin: "50% 0%" },
    {
      rotateX: 0,
      rotateY: 0,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 98%", end: "top 55%", scrub: 0.8 },
    },
  );
}

export default function RevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    (window as any).__auraReveal = true;
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      root.classList.remove("motion-ok");
      return;
    }

    const ctx = gsap.context(() => {});
    const scan = () =>
      ctx.add(() => {
        assignAuto();
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(revealOne);
        document.querySelectorAll<HTMLElement>("[data-speed]").forEach(parallaxOne);
        document.querySelectorAll<HTMLElement>("main > section:not([data-no-depth])").forEach((el) => depthOne(el, "fold"));
        document.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => depthOne(el));
      });
    scan();

    // Catch content that appears later (shop filters, client components).
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = window.requestAnimationFrame(() => {
        queued = 0;
        scan();
        ScrollTrigger.refresh();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      window.cancelAnimationFrame(queued);
      ctx.revert();
      document.querySelectorAll<HTMLElement>("[data-reveal-auto]").forEach((n) => {
        delete n.dataset.reveal;
        delete n.dataset.revealAuto;
      });
      document.querySelectorAll<HTMLElement>("[data-reveal-done],[data-reveal-child-done],[data-speed-done],[data-depth-done]").forEach((n) => {
        delete n.dataset.revealDone;
        delete n.dataset.revealChildDone;
        delete n.dataset.speedDone;
        delete n.dataset.depthDone;
      });
    };
  }, [pathname]);

  return null;
}
