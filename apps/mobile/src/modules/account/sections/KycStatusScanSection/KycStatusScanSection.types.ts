import type { UseKycStatusReturn } from "@/modules/account/lib/use-kyc-status";

export type KycStatusScanSectionProps = Pick<
  UseKycStatusReturn,
  | "t"
  | "videoRef"
  | "fileInputRef"
  | "cameraReady"
  | "goBack"
  | "captureFromCamera"
  | "submitCapturedFile"
> & {
  className?: string;
};
