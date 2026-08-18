import { FLAG_SVG_BY_CODE, type FlagCode } from "./flag-svgs.generated";
import { flagVariants } from "./Flag.styles";
import {
  FLAG_SIZES,
  type FlagProps,
  type FlagSize,
} from "./Flag.types";

export { FLAG_SVG_BY_CODE, FLAG_CODES } from "./flag-svgs.generated";
export type { FlagCode } from "./flag-svgs.generated";
export { FLAG_SIZES } from "./Flag.types";
export { flagVariants } from "./Flag.styles";

export function resolveFlagSize(size: FlagSize = "sm"): number {
  return typeof size === "number" ? size : FLAG_SIZES[size];
}

export function normalizeFlagCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isFlagCode(code: string): code is FlagCode {
  return normalizeFlagCode(code) in FLAG_SVG_BY_CODE;
}

export function getFlagSvg(code: string): string | undefined {
  return FLAG_SVG_BY_CODE[normalizeFlagCode(code) as FlagCode];
}

export function Flag({
  code,
  size = "sm",
  title,
  rounded = false,
  className,
  style,
  ...props
}: FlagProps) {
  const normalized = normalizeFlagCode(code);
  const svg = getFlagSvg(normalized);
  const px = resolveFlagSize(size);
  const { root } = flagVariants({ rounded });

  if (!svg) {
    return null;
  }

  const label = title ?? normalized;

  return (
    <span
      {...props}
      role="img"
      aria-label={label}
      title={label}
      className={root({ className })}
      style={{ width: px, height: px, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
