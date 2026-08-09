import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type GalleryMediaKind = "video" | "image" | "document";

/** Items newer than this window show the “New” badge. */
export const GALLERY_NEW_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type GalleryMediaItem = {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  /** Kind of media shown in gallery cards. */
  mediaKind?: GalleryMediaKind;
  /** Creator / uploader display name. */
  author?: string;
  /** Absolute view count; UI formats compactly. */
  views?: number;
  /** Video duration label (e.g. "01:40"). */
  durationLabel?: string;
  /** ISO timestamp when the item was added — drives the “New” badge. */
  createdAt?: string;
};

const DEFAULT_GALLERY_SEEDS: GalleryMediaItem[] = [
  {
    id: "gallery-video-form",
    url: PLACEHOLDER_IMAGE,
    title: "۳ روش ساده برای بهتر شدن فرم اسکات",
    description: "ویدیوی کوتاه مربی برای اصلاح تکنیک اسکات.",
    mediaKind: "video",
    author: "Eddie Yong",
    views: 5500,
    durationLabel: "01:40",
    createdAt: new Date().toISOString(),
  },
  {
    id: "gallery-image-floor",
    url: PLACEHOLDER_IMAGE,
    title: "سالن اصلی باشگاه",
    description: "فضای وزنه‌آزاد و رک‌های المپیک با نور طبیعی.",
    mediaKind: "image",
    author: "Gym4Me Studio",
    views: 12800,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "gallery-video-hiit",
    url: PLACEHOLDER_IMAGE,
    title: "تور کلاس HIIT گروهی",
    description: "نگاهی به سالن کلاس‌های HIIT و گروهی.",
    mediaKind: "video",
    author: "سارا احمدی",
    views: 3200,
    durationLabel: "02:15",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "gallery-doc-rules",
    url: PLACEHOLDER_IMAGE,
    title: "راهنمای قوانین باشگاه",
    description: "فایل PDF قوانین و نکات ایمنی اعضا.",
    mediaKind: "document",
    author: "پذیرش باشگاه",
    views: 890,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "gallery-image-recovery",
    url: PLACEHOLDER_IMAGE,
    title: "فضای ریکاوری",
    description: "منطقه کشش، موبیلیتی و ریکاوری پس از تمرین.",
    mediaKind: "image",
    author: "کیانوش مرادی",
    views: 4100,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "gallery-video-tour",
    url: PLACEHOLDER_IMAGE,
    title: "تور کامل باشگاه",
    description: "ویدیوی معرفی امکانات و طبقات باشگاه.",
    mediaKind: "video",
    author: "Gym4Me Studio",
    views: 22100,
    durationLabel: "04:05",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/** Demo gallery payload used by club/coach/class detail fixtures. */
export const DEFAULT_GALLERY_ITEMS: GalleryMediaItem[] = DEFAULT_GALLERY_SEEDS;

/** Whether a gallery item should show the “New” badge. */
export function isGalleryItemNew(
  createdAt?: string | Date | null,
  now = Date.now(),
): boolean {
  if (createdAt == null) return false;
  const ts =
    createdAt instanceof Date ? createdAt.getTime() : Date.parse(createdAt);
  if (!Number.isFinite(ts)) return false;
  return now - ts <= GALLERY_NEW_MAX_AGE_MS;
}

/** Compact view count for gallery cards (e.g. 5500 → "5.5k"). */
export function formatGalleryViews(views: number): string {
  if (!Number.isFinite(views) || views < 0) return "0";
  if (views < 1000) return String(Math.round(views));
  const thousands = views / 1000;
  const rounded =
    thousands >= 100
      ? Math.round(thousands).toString()
      : thousands.toFixed(thousands >= 10 ? 0 : 1).replace(/\.0$/, "");
  return `${rounded}k`;
}

/**
 * Fills missing gallery-card metadata from demo seeds so body cards
 * always have a media kind / author / views when the API omits them.
 */
export function withGalleryCardDefaults(
  item: GalleryMediaItem,
  index: number,
): GalleryMediaItem {
  const seed = DEFAULT_GALLERY_SEEDS[index % DEFAULT_GALLERY_SEEDS.length];
  return {
    id: item.id ?? seed?.id ?? `gallery-${index}`,
    url: item.url,
    title: item.title ?? seed?.title,
    description: item.description ?? seed?.description,
    mediaKind: item.mediaKind ?? seed?.mediaKind ?? "image",
    author: item.author ?? seed?.author,
    views: item.views ?? seed?.views,
    durationLabel: item.durationLabel ?? seed?.durationLabel,
    createdAt: item.createdAt ?? seed?.createdAt,
  };
}

export function galleryFromImages(images: string[]): GalleryMediaItem[] {
  return images.map((url, index) => withGalleryCardDefaults({ url }, index));
}
