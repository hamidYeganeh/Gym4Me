import { z } from "zod";
import type {
  AdminBanner,
  BannerPlacement,
  BannerSlideInput,
  PublishStatus,
} from "@repo/api";
import { BANNER_PLACEMENTS, PUBLISH_STATUSES } from "../../lib/banner-constants";

export type BannersFormMessages = {
  required: string;
  slidesRequired: string;
};

const placementSchema = z.custom<BannerPlacement>(
  (value) =>
    typeof value === "string" && (BANNER_PLACEMENTS as string[]).includes(value),
);
const publishStatusSchema = z.custom<PublishStatus>(
  (value) =>
    typeof value === "string" && (PUBLISH_STATUSES as string[]).includes(value),
);

export function createBannersFormSchema(messages: BannersFormMessages) {
  return z.object({
    title: z.string().trim().min(2, messages.required),
    placement: placementSchema,
    slides: z.array(z.custom<BannerSlideInput>()).min(1, messages.slidesRequired),
    publishStatus: publishStatusSchema,
    startsAt: z.string(),
    endsAt: z.string(),
    order: z.string(),
  });
}

export type BannersFormValues = z.infer<
  ReturnType<typeof createBannersFormSchema>
>;

export const bannersFormDefaults: BannersFormValues = {
  title: "",
  placement: "discovery_home",
  slides: [],
  publishStatus: "draft",
  startsAt: "",
  endsAt: "",
  order: "0",
};

export function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromLocalInputValue(value: string) {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function bannerToFormValues(banner: AdminBanner): BannersFormValues {
  return {
    title: banner.title,
    placement: banner.placement,
    slides: banner.slides.map((slide) => ({
      mediaId: slide.mediaId,
      linkKind: slide.linkKind,
      linkUrl: slide.linkUrl ?? undefined,
      alt: slide.alt ?? undefined,
    })),
    publishStatus: banner.publishStatus,
    startsAt: toLocalInputValue(banner.schedule.startsAt),
    endsAt: toLocalInputValue(banner.schedule.endsAt),
    order: String(banner.order),
  };
}
