import {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerPlacement,
  BannerRadius,
} from '../common/enums';

type LeanBannerSlide = {
  mediaId: { toString(): string };
  linkKind: string;
  linkUrl?: string;
  alt?: string;
  gradient?: boolean;
  title?: { text: string; placement?: string } | null;
  action?: { label: string; placement?: string } | null;
};

export type LeanBanner = {
  _id: { toString(): string };
  label?: string;
  /** @deprecated Legacy admin label — read-only fallback. */
  title?: string;
  slug?: string;
  placement: string;
  ratio?: string;
  radius?: string;
  slides: LeanBannerSlide[];
};

export type BannerFrame = {
  ratio: BannerAspectRatio;
  radius: BannerRadius;
};

export type PublicBanner = {
  id: string;
  slug: string;
  label: string;
  placement: BannerPlacement;
  ratio: BannerAspectRatio;
  radius: BannerRadius;
  slides: Array<{
    mediaId: string;
    linkKind: BannerLinkKind;
    linkUrl: string | null;
    alt: string | null;
    gradient: boolean;
    title: { text: string; placement: BannerOverlayPlacement } | null;
    action: { label: string; placement: BannerOverlayPlacement } | null;
  }>;
};

export function resolveBannerLabel(doc: LeanBanner) {
  return doc.label?.trim() || doc.title?.trim() || '';
}

export function resolveBannerSlug(doc: LeanBanner) {
  return doc.slug?.trim() || doc._id.toString();
}

export function resolveBannerFrame(
  ratio?: BannerAspectRatio | string,
  radius?: BannerRadius | string,
): BannerFrame {
  return {
    ratio: (ratio as BannerAspectRatio | undefined) ?? BannerAspectRatio.RATIO_16_9,
    radius: (radius as BannerRadius | undefined) ?? BannerRadius.SURFACE,
  };
}

export function resolveBannerFrameFromDoc(doc: LeanBanner): BannerFrame {
  return resolveBannerFrame(doc.ratio, doc.radius);
}

function mapPublicSlide(slide: LeanBannerSlide) {
  return {
    mediaId: slide.mediaId.toString(),
    linkKind: slide.linkKind as BannerLinkKind,
    linkUrl: slide.linkUrl ?? null,
    alt: slide.alt ?? null,
    gradient: slide.gradient ?? false,
    title: slide.title?.text
      ? {
          text: slide.title.text,
          placement: (slide.title.placement ??
            BannerOverlayPlacement.BOTTOM_START) as BannerOverlayPlacement,
        }
      : null,
    action: slide.action?.label
      ? {
          label: slide.action.label,
          placement: (slide.action.placement ??
            BannerOverlayPlacement.BOTTOM_END) as BannerOverlayPlacement,
        }
      : null,
  };
}

export function mapBannerToPublic(doc: LeanBanner): PublicBanner {
  const frame = resolveBannerFrameFromDoc(doc);
  return {
    id: doc._id.toString(),
    slug: resolveBannerSlug(doc),
    label: resolveBannerLabel(doc),
    placement: doc.placement as BannerPlacement,
    ratio: frame.ratio,
    radius: frame.radius,
    slides: doc.slides.map((slide) => mapPublicSlide(slide)),
  };
}
