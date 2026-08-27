import type { LineShadowTextProps } from "../LineShadowText/LineShadowText.types";

export type LoopingWordsProps = Omit<LineShadowTextProps, "children"> & {
  words: string[];
  /** Milliseconds each word stays visible before advancing. */
  duration?: number;
};
