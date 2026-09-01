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
  gradient: boolean;
  title: BannerSlideTitle | null;
  action: BannerSlideAction | null;
};

export type Banner = {
  id: string;
  slug: string;
  label: string;
  placement: BannerPlacement;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
  slides: BannerSlide[];
};

export type ListBannersQuery = {
  placement: BannerPlacement;
};
