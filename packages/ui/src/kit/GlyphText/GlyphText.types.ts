import type { HTMLMotionProps } from "motion/react";

/**
 * Props for {@link GlyphText}.
 */
export interface GlyphTextProps
  extends Omit<
    HTMLMotionProps<"span">,
    "ref" | "children" | "style" | "animate" | "transition" | "color"
  > {
  /**
   * Text to reveal. Pass multiple strings to rotate when {@link GlyphTextProps.repeat} is `true`.
   */
  text: string | string[];
  /**
   * Colors sampled across the moving gradient band.
   * Defaults to theme stats + accent tokens (`--stats-*`, `--accent`).
   */
  colors?: string[];
  /**
   * CSS color for revealed text after the sweep and for leading/trailing regions during the animation.
   * @defaultValue `"var(--foreground)"`
   */
  textColor?: string;
  /**
   * Explicit writing direction. When omitted, inherits from the document / ancestors.
   * Sweep direction mirrors this (LTR → left-to-right, RTL → right-to-left).
   */
  dir?: "ltr" | "rtl" | "auto";
  /**
   * Duration of one sweep pass, in seconds.
   * @defaultValue `1.5`
   */
  duration?: number;
  /**
   * Delay before the sweep starts, in seconds.
   * @defaultValue `0`
   */
  delay?: number;
  /**
   * When `text` is an array, replay the sweep and advance to the next string after each completion.
   * @defaultValue `false`
   */
  repeat?: boolean;
  /**
   * Pause between cycles when {@link GlyphTextProps.repeat} is `true`, in seconds.
   * @defaultValue `0.5`
   */
  repeatDelay?: number;
  /**
   * If `true`, the animation starts only after the element enters the viewport.
   * @defaultValue `true`
   */
  startOnView?: boolean;
  /**
   * Passed to `useInView`: if `true`, in-view detection fires at most once (no replay on scroll-back).
   * @defaultValue `true`
   */
  once?: boolean;
  /**
   * Additional class names for the animated `span` (e.g. typography utilities).
   */
  className?: string;
  /**
   * When `text` has multiple entries, use the widest string’s width for layout instead of animating width per line.
   * @defaultValue `false`
   */
  fixedWidth?: boolean;
}
