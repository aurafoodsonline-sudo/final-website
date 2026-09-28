"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Makes every React Bits (motion) animation honour the device's reduced-motion setting. */
export default function MotionProviders({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
