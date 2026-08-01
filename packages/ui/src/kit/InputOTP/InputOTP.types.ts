import type { ComponentPropsWithoutRef } from "react";
import type { InputOTP as HeroInputOTP } from "@heroui/react";

type HeroInputOTPProps = ComponentPropsWithoutRef<typeof HeroInputOTP>;

export interface InputOTPProps
  extends Omit<HeroInputOTPProps, "children" | "maxLength" | "variant"> {
  /** Number of digit slots. Defaults to 4. */
  length?: number;
  className?: string;
}
