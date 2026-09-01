"use client";

import {
  BannerCarousel,
  BannerCarouselSkeleton,
} from "@repo/ui/kit/BannerCarousel";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type { DiscoveryHomeBannersSectionProps } from "./DiscoveryHomeBannersSection.types";
import { discoveryHomeBannersSectionVariants } from "./DiscoveryHomeBannersSection.styles";

function openBannerLink(
  router: ReturnType<typeof useRouter>,
  linkKind: "none" | "internal" | "external",
  linkUrl: string | null,
) {
  if (!linkUrl) return;
  if (linkKind === "internal") {
    router.push(linkUrl);
  } else if (linkKind === "external") {
    window.open(linkUrl, "_blank", "noopener,noreferrer");
  }
}

export function DiscoveryHomeBannersSection({
  banners,
  isLoading = false,
}: DiscoveryHomeBannersSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();
  const slots = discoveryHomeBannersSectionVariants();

  if (isLoading) {
    return <BannerCarouselSkeleton aspectRatio="16/9" radius="surface" />;
  }

  if (banners.length === 0) return null;

  return (
    <div className={slots.root()}>
      {banners.map((banner) => (
        <BannerCarousel
          aria-label={banner.label || t("bannersLabel")}
          aspectRatio={banner.ratio}
          key={banner.id}
          radius={banner.radius}
          slideLabel={(current, total) =>
            t("bannerSlideLabel", { current, total })
          }
          slides={banner.slides.map((slide) => {
            const openLink =
              slide.linkKind !== "none" && slide.linkUrl
                ? () => openBannerLink(router, slide.linkKind, slide.linkUrl)
                : undefined;

            return {
              id: slide.id,
              imageUrl: slide.imageUrl,
              alt: slide.alt,
              gradient: slide.gradient,
              title: slide.title ?? undefined,
              action: slide.action
                ? {
                    label: slide.action.label,
                    placement: slide.action.placement,
                    onPress: openLink,
                  }
                : undefined,
              onPress: slide.action ? undefined : openLink,
            };
          })}
        />
      ))}
    </div>
  );
}
