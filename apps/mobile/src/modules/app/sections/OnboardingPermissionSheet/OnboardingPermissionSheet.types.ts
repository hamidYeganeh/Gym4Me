import type { DevicePermissionKind } from "@/shared/lib/device-permissions";

export type OnboardingPermissionSheetLabels = {
  title: string;
  subtitle: string;
  sampleTitle: string;
  sampleBody: string;
  sampleAction: string;
  sampleTime: string;
  info: string;
  continue: string;
  skip: string;
};

export type OnboardingPermissionSheetProps = {
  kind: DevicePermissionKind;
  isOpen: boolean;
  labels: OnboardingPermissionSheetLabels;
  isRequesting?: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onSkip: () => void;
};
