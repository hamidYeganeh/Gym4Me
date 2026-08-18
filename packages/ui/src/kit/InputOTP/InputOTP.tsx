"use client";

import { InputOTP as HeroInputOTP, REGEXP_ONLY_DIGITS } from "@heroui/react/input-otp";
import { browserAutofillOffProps } from "@repo/theme";
import { inputOTPVariants } from "./InputOTP.styles";
import type { InputOTPProps } from "./InputOTP.types";

export function InputOTP({
  length = 4,
  size = "lg",
  className,
  pattern = REGEXP_ONLY_DIGITS,
  autoComplete = browserAutofillOffProps.autoComplete,
  ...props
}: InputOTPProps) {
  const styles = inputOTPVariants({ size });

  return (
    <HeroInputOTP
      maxLength={length}
      pattern={pattern}
      variant="primary"
      className={styles.root({ className })}
      {...props}
      autoComplete={autoComplete}
    >
      <HeroInputOTP.Group className={styles.group()}>
        {Array.from({ length }, (_, index) => (
          <HeroInputOTP.Slot
            key={index}
            index={index}
            className={styles.slot()}
          />
        ))}
      </HeroInputOTP.Group>
    </HeroInputOTP>
  );
}
