import type { FormEvent } from "react";
import type { UseKycStatusReturn } from "@/modules/account/lib/use-kyc-status";

export type KycStatusDetailsSectionProps = Pick<
  UseKycStatusReturn,
  | "nationalId"
  | "setNationalId"
  | "nationalIdError"
  | "birthDateJalali"
  | "setBirthDateJalali"
  | "birthDateError"
  | "error"
  | "isPending"
  | "handleDetails"
  | "goBack"
  | "t"
> & {
  className?: string;
};

export type KycStatusDetailsFormEvent = FormEvent;
