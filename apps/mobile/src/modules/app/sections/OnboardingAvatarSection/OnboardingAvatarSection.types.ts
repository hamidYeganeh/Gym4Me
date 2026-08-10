export type OnboardingAvatarMode = "setup" | "uploading" | "ready";

export type OnboardingAvatarValue = {
  mode: OnboardingAvatarMode;
  mediaId: string | null;
  previewUrl: string | null;
  fileName: string;
  progress: number;
};

export type OnboardingAvatarLabels = {
  title: string;
  upload: string;
  premade: string;
  skip: string;
  uploading: string;
};

export type OnboardingAvatarSectionProps = {
  value: OnboardingAvatarValue;
  labels: OnboardingAvatarLabels;
  onUpload: (file: File) => void;
  onPremade: () => void;
  onSkip: () => void;
  className?: string;
};
