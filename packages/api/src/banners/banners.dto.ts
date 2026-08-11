import type { BannerLinkKind, BannerPlacement } from "../types";

export type BannerSlide = {
  mediaId: string;
  linkKind: BannerLinkKind;
  linkUrl: string | null;
  alt: string | null;
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  slides: BannerSlide[];
};

export type ListBannersQuery = {
  placement: BannerPlacement;
};
