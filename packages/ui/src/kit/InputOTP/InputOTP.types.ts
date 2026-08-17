import type { ComponentPropsWithoutRef } from "react";
import type { InputOTP as HeroInputOTP } from "@heroui/react";
import type { InputOTPVariantProps } from "./InputOTP.styles";

type HeroInputOTPProps = ComponentPropsWithoutRef<typeof HeroInputOTP>;

export interface InputOTPProps
  extends Omit<
    HeroInputOTPProps,
    "children" | "maxLength" | "variant" | "size"
  > {
  /** Number of digit slots. Defaults to 4. */
  length?: number;
  /** `lg` = showcase; `md` = auth (6 digits on 375 frame). */
  size?: NonNullable<InputOTPVariantProps["size"]>;
  className?: string;
}
