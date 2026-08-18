import type { RequestOtpInput } from "@repo/api";

export type AuthLoginOtpRequestFormProps = {
  className?: string;
  defaultPhone?: string;
  isPending?: boolean;
  onSubmit: (payload: RequestOtpInput) => Promise<void>;
};
