import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerPlacement,
  BannerRadius,
} from "../types";

export type BannerSlideTitle = {
  text: string;
  placement: BannerOverlayPlacement;
};

export type BannerSlideAction = {
  label: string;
  placement: BannerOverlayPlacement;
};

export type BannerSlide = {
  mediaId: string;
  linkKind: BannerLinkKind;
  linkUrl: string | null;
  alt: string | null;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
  gradient: boolean;
  title: BannerSlideTitle | null;
  action: BannerSlideAction | null;
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  slides: BannerSlide[];
};

export type ListBannersQuery = {
  placement: BannerPlacement;
};
