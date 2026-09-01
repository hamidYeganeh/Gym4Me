import { z } from "zod";
import type {
  AdminBanner,
  BannerAspectRatio,
  BannerPlacement,
  BannerRadius,
  BannerSlideInput,
  PublishStatus,
} from "@repo/api";
import {
  BANNER_ASPECT_RATIOS,
  BANNER_PLACEMENTS,
  BANNER_RADII,
  PUBLISH_STATUSES,
} from "../../lib/banner-constants";

export type BannersFormMessages = {
  required: string;
  slidesRequired: string;
};

const placementSchema = z.custom<BannerPlacement>(
  (value) =>
    typeof value === "string" &&
    (BANNER_PLACEMENTS as string[]).includes(value),
);
const publishStatusSchema = z.custom<PublishStatus>(
  (value) =>
    typeof value === "string" && (PUBLISH_STATUSES as string[]).includes(value),
);
const ratioSchema = z.custom<BannerAspectRatio>(
  (value) =>
    typeof value === "string" &&
    (BANNER_ASPECT_RATIOS as string[]).includes(value),
);
const radiusSchema = z.custom<BannerRadius>(
  (value) =>
    typeof value === "string" && (BANNER_RADII as string[]).includes(value),
);

export function createBannersFormSchema(messages: BannersFormMessages) {
  return z
    .object({
      label: z.string().trim().min(1, messages.required).max(200),
      slug: z.string().trim().max(120).optional(),
      placement: placementSchema,
      ratio: ratioSchema,
      radius: radiusSchema,
      slides: z
        .array(z.custom<BannerSlideInput>())
        .min(1, messages.slidesRequired)
        .max(10, messages.slidesRequired),
      publishStatus: publishStatusSchema,
      startsAt: z.string(),
      endsAt: z.string(),
      order: z
        .string()
        .refine(
          (value) => /^\d+$/.test(value) && Number(value) >= 0,
          messages.required,
        ),
    })
    .superRefine((values, ctx) => {
      if (
        values.startsAt &&
        values.endsAt &&
        new Date(values.endsAt) <= new Date(values.startsAt)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: messages.required,
        });
      }
    });
}

export type BannersFormValues = z.infer<
  ReturnType<typeof createBannersFormSchema>
>;

export const bannersFormDefaults: BannersFormValues = {
  label: "",
  slug: "",
  placement: "discovery_home",
  ratio: "16/9",
  radius: "surface",
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
    label: banner.label,
    slug: banner.slug,
    placement: banner.placement,
    ratio: banner.ratio,
    radius: banner.radius,
    slides: banner.slides.map((slide) => ({
      mediaId: slide.mediaId,
      linkKind: slide.linkKind,
      linkUrl: slide.linkUrl ?? undefined,
      alt: slide.alt ?? undefined,
      gradient: slide.gradient,
      title: slide.title ?? undefined,
      action: slide.action ?? undefined,
    })),
    publishStatus: banner.publishStatus,
    startsAt: toLocalInputValue(banner.schedule.startsAt),
    endsAt: toLocalInputValue(banner.schedule.endsAt),
    order: String(banner.order),
  };
}
