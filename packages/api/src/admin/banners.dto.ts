import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerPlacement,
  BannerRadius,
  ListQuery,
  ListQueryFilter,
  PublishStatus,
} from "../types";
import type {
  BannerSlide,
  BannerSlideAction,
  BannerSlideTitle,
} from "../banners/banners.dto";

export type AdminBanner = {
  id: string;
  slug: string;
  label: string;
  placement: BannerPlacement;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
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
  gradient?: boolean;
  title?: BannerSlideTitle;
  action?: BannerSlideAction;
};

export type BannerScheduleInput = {
  startsAt?: string;
  endsAt?: string;
};

export type CreateBannerInput = {
  label: string;
  placement: BannerPlacement;
  ratio?: BannerAspectRatio;
  radius?: BannerRadius;
  slides: BannerSlideInput[];
  publishStatus?: PublishStatus;
  schedule?: BannerScheduleInput;
  order?: number;
};

export type UpdateBannerInput = {
  label?: string;
  placement?: BannerPlacement;
  ratio?: BannerAspectRatio;
  radius?: BannerRadius;
  slides?: BannerSlideInput[];
  publishStatus?: PublishStatus;
  schedule?: BannerScheduleInput;
  order?: number;
};

export type AdminBannersSortBy =
  | "label"
  | "title"
  | "placement"
  | "publishStatus"
  | "order"
  | "startsAt"
  | "endsAt"
  | "createdAt"
  | "updatedAt";

export type ListAdminBannersQuery = ListQuery<AdminBannersSortBy> & {
  placement?: ListQueryFilter<BannerPlacement>;
  publishStatus?: ListQueryFilter<PublishStatus>;
};
