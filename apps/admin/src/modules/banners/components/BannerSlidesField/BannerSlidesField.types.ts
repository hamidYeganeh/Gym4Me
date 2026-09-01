import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerRadius,
  BannerSlideInput,
} from "@repo/api";

export type BannerSlidesFieldLabels = {
  label: string;
  hint?: string;
  empty: string;
  linkKindLabel: string;
  linkKinds: Record<BannerLinkKind, string>;
  linkUrlLabel: string;
  linkUrlInternalHint: string;
  linkUrlExternalHint: string;
  altLabel: string;
  gradientLabel: string;
  ratioLabel: string;
  ratios: Record<BannerAspectRatio, string>;
  radiusLabel: string;
  radii: Record<BannerRadius, string>;
  titleTextLabel: string;
  titlePlacementLabel: string;
  actionLabelLabel: string;
  actionPlacementLabel: string;
  overlayPlacements: Record<BannerOverlayPlacement, string>;
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
  frameRatio: BannerAspectRatio;
  frameRadius: BannerRadius;
  disabled?: boolean;
};
