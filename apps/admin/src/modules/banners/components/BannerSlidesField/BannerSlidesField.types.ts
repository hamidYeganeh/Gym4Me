import type { BannerSlideInput } from "@repo/api";

export type BannerSlidesFieldLabels = {
  label: string;
  hint?: string;
  empty: string;
  linkKindLabel: string;
  linkKinds: Record<"none" | "internal" | "external", string>;
  linkUrlLabel: string;
  linkUrlInternalHint: string;
  linkUrlExternalHint: string;
  altLabel: string;
  remove: string;
  uploaderTitle: string;
  uploaderDescription: string;
  uploaderButtonLabel: string;
  uploadError: string;
};

export type BannerSlidesFieldProps = {
  value: BannerSlideInput[];
  onChange: (slides: BannerSlideInput[]) => void;
  labels: BannerSlidesFieldLabels;
  disabled?: boolean;
};
