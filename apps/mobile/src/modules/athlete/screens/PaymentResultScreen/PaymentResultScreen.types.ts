export type PaymentResultStatus = "success" | "failed";

export type PaymentResultScreenProps = {
  /** Falls back to reading the `status` search param when omitted. */
  defaultStatus?: PaymentResultStatus;
};
