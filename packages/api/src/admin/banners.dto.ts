import type {
  BannerLinkKind,
  BannerPlacement,
  PublishStatus,
} from "../types";
import type { BannerSlide } from "../banners/banners.dto";

export type AdminBanner = {
  id: string;
  title: string;
  placement: BannerPlacement;
  slides: BannerSlide[];
  publishStatus: PublishStatus;
  schedule: {
    startsAt: string | null;
    endsAt: string | null;
  };
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type BannerSlideInput = {
  mediaId: string;
  linkKind?: BannerLinkKind;
  linkUrl?: string;
  alt?: string;
};

export type BannerScheduleInput = {
  startsAt?: string;
  endsAt?: string;
};

export type CreateBannerInput = {
  title: string;
  placement: BannerPlacement;
  slides: BannerSlideInput[];
  publishStatus?: PublishStatus;
  schedule?: BannerScheduleInput;
  order?: number;
};

export type UpdateBannerInput = {
  title?: string;
  placement?: BannerPlacement;
  slides?: BannerSlideInput[];
  publishStatus?: PublishStatus;
  schedule?: BannerScheduleInput;
  order?: number;
};

export type ListAdminBannersQuery = {
  page?: number;
  page_size?: number;
  placement?: BannerPlacement;
  publishStatus?: PublishStatus;
  search?: string;
};
