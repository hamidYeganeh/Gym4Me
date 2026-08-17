"use client";

import { PhoneField } from "@repo/ui/kit/PhoneField";
import type { AuthPhoneFieldProps } from "./AuthPhoneField.types";

/** Mobile auth adapter — Iran defaults live on `@repo/ui/kit/PhoneField`. */
export function AuthPhoneField(props: AuthPhoneFieldProps) {
  return <PhoneField {...props} />;
}
