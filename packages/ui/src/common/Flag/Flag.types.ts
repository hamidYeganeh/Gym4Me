import type { HTMLAttributes } from "react";
import type { FlagCode } from "./flag-svgs.generated";

export const FLAG_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

export type FlagSizeToken = keyof typeof FLAG_SIZES;
export type FlagSize = FlagSizeToken | number;

export type FlagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** ISO 3166-1 alpha-2 (or regional) code, e.g. `"IR"`, `"GB-SCT"`. */
  code: FlagCode | (string & {});
  size?: FlagSize;
  /** Accessible name; defaults to the country code. */
  title?: string;
  /** When true, wraps the SVG in a circle clip (phone / avatar style). */
  rounded?: boolean;
};

export type { FlagCode };
