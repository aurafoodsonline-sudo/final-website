"use client";

import SplitText from "@/components/reactbits/SplitText";
import type { Lang } from "@/lib/constants";

type Props = {
  text: string;
  lang: Lang;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  align?: "center" | "start";
  delay?: number;
};

/**
 * Headline reveal (React Bits SplitText + GSAP).
 * English animates letter by letter; Urdu animates word by word, because splitting
 * Nastaliq into letters would break the joined script, and it isn't clipped (tall glyphs).
 */
export default function AnimatedTitle({ text, lang, tag = "h2", className = "", align = "center", delay }: Props) {
  const ur = lang === "ur";
  const textAlign = align === "center" ? "center" : ur ? "right" : "left";
  return (
    <SplitText
      text={text}
      tag={tag}
      className={className}
      textAlign={textAlign}
      splitType={ur ? "words" : "chars"}
      clip={!ur}
      delay={delay ?? (ur ? 90 : 28)}
      duration={ur ? 0.9 : 0.8}
      ease="power3.out"
      from={ur ? { opacity: 0, y: 24 } : { opacity: 0, y: "105%" }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.15}
      rootMargin="-40px"
    />
  );
}
