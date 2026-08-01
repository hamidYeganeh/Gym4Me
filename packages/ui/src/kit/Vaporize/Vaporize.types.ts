import type { ReactNode } from "react";
import type { VaporizeDirection } from "./vaporize.engine";

export type VaporizeProps = {
  children: ReactNode;
  /** When true, captures the content and plays a one-shot vaporize, then calls onComplete. */
  active?: boolean;
  onComplete?: () => void;
  direction?: VaporizeDirection;
  /** Particle density 0–10 (higher keeps more particles alive longer). */
  density?: number;
  /** Multiplier for particle spread. */
  spread?: number;
  /** Vaporize duration in seconds. */
  duration?: number;
  /** Height collapse duration after vaporize (ms). */
  collapseDurationMs?: number;
  className?: string;
};
