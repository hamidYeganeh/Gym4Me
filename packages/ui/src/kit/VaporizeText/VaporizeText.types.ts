import type { VaporizeDirection } from "../Vaporize/vaporize.engine";

export enum VaporizeTextTag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

export type VaporizeTextProps = {
  texts: string[];
  font?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: number;
  };
  color?: string;
  spread?: number;
  density?: number;
  animation?: {
    vaporizeDuration?: number;
    fadeInDuration?: number;
    waitDuration?: number;
  };
  direction?: VaporizeDirection;
  alignment?: "left" | "center" | "right";
  tag?: VaporizeTextTag;
  className?: string;
};
