import type {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerRadius,
} from "@repo/api";

/**
 * Temporary discovery-home banner fixtures. Replaceable by placement API
 * slides without changing DiscoveryHomeBannersSection public props.
 */
export type DiscoveryBannerSlide = {
  id: string;
  imageUrl: string;
  alt: string | null;
  linkKind: BannerLinkKind;
  linkUrl: string | null;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
  gradient: boolean;
  title?: {
    text: string;
    placement: BannerOverlayPlacement;
  };
  action?: {
    label: string;
    placement: BannerOverlayPlacement;
  };
};

export const MOCK_DISCOVERY_HOME_BANNERS: DiscoveryBannerSlide[] = [
  {
    id: "mock-banner-strength",
    imageUrl: "/demo/banners/strength.png",
    alt: "تمرین قدرتی در باشگاه",
    linkKind: "internal",
    linkUrl: "/discovery/clubs",
    ratio: "16/9",
    radius: "surface",
    gradient: true,
    title: {
      text: "باشگاه نزدیکت را پیدا کن",
      placement: "bottom-start",
    },
    action: {
      label: "مشاهده باشگاه‌ها",
      placement: "bottom-end",
    },
  },
  {
    id: "mock-banner-studio",
    imageUrl: "/demo/banners/studio.png",
    alt: "کلاس استودیو و یوگا",
    linkKind: "internal",
    linkUrl: "/discovery/sports",
    ratio: "16/9",
    radius: "surface",
    gradient: true,
    title: {
      text: "کلاس‌های آرام و متمرکز",
      placement: "top-start",
    },
    action: {
      label: "کاوش ورزش‌ها",
      placement: "bottom-start",
    },
  },
  {
    id: "mock-banner-pool",
    imageUrl: "/demo/banners/pool.png",
    alt: "استخر و فضای آبی باشگاه",
    linkKind: "internal",
    linkUrl: "/discovery/clubs",
    ratio: "16/9",
    radius: "compact",
    gradient: true,
    title: {
      text: "فضاهای آبی پریمیوم",
      placement: "center",
    },
    action: {
      label: "رزرو کن",
      placement: "bottom-center",
    },
  },
];
