import type { CSSProperties } from "react";
import type { Transition, Variants } from "motion/react";

export type TextEffectPreset = "blur" | "fade-in-blur" | "scale" | "fade" | "slide";

export type TextEffectPer = "word" | "char" | "line";

export type TextEffectElement =
  | "article"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "li"
  | "p"
  | "section"
  | "span";

export type TextEffectProps = {
  children: string;
  per?: TextEffectPer;
  as?: TextEffectElement;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: TextEffectPreset;
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  segmentWrapperClassName?: string;
  containerTransition?: Transition;
  segmentTransition?: Transition;
  style?: CSSProperties;
};
