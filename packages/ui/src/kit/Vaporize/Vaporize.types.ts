import type { ReactNode } from "react";
import type { VaporizeDirection } from "./vaporize.engine";

export type VaporizeProps = {
  children?: ReactNode;
  /** Renders when `children` is omitted; joined with spaces for capture. */
  texts?: string[];
  /** Triggers a one-shot capture + particle dissolve, then `onComplete`. */
  active?: boolean;
  onComplete?: () => void;
  direction?: VaporizeDirection;
  /** 0–10 — higher keeps more particles visible longer. */
  density?: number;
  spread?: number;
  /** Dissolve length in seconds. */
  duration?: number;
  className?: string;
};
