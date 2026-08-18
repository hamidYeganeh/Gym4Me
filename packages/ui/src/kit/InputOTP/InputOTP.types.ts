import type { ComponentPropsWithoutRef } from "react";
import type { InputOTP as HeroInputOTP } from "@heroui/react/input-otp";
import type { InputOTPVariantProps } from "./InputOTP.styles";

type HeroInputOTPProps = ComponentPropsWithoutRef<typeof HeroInputOTP>;

export interface InputOTPProps
  extends Omit<
    HeroInputOTPProps,
    "children" | "maxLength" | "variant" | "size"
  > {
  /** Number of digit slots. Defaults to 4. */
  length?: number;
  /** `lg` = fixed showcase; `md` = auth (`flex-1` square slots). */
  size?: NonNullable<InputOTPVariantProps["size"]>;
  className?: string;
}
