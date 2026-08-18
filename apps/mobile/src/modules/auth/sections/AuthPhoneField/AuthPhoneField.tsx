"use client";

import { PhoneField } from "@repo/ui/kit/PhoneField";
import type { AuthPhoneFieldProps } from "./AuthPhoneField.types";

/** Mobile auth adapter — Iran dialing defaults for phone OTP. */
export function AuthPhoneField({
  countryCode = "+98",
  showCountryChevron = true,
  ...props
}: AuthPhoneFieldProps) {
  return (
    <PhoneField
      {...props}
      countryCode={countryCode}
      showCountryChevron={showCountryChevron}
    />
  );
}
