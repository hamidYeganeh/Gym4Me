"use client";

import { BannerCarousel } from "@repo/ui/kit/BannerCarousel";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { DiscoveryHomeBannersSectionProps } from "./DiscoveryHomeBannersSection.types";

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
}: DiscoveryHomeBannersSectionProps) {
  const t = useTranslations("DiscoveryHome");
  const router = useRouter();

  if (banners.length <= 1) return null;

  return (
    <BannerCarousel
      aria-label={t("bannersLabel")}
      slideLabel={(current, total) =>
        t("bannerSlideLabel", { current, total })
      }
      slides={banners.slice(1).map((slide) => ({
        id: slide.id,
        imageUrl: slide.imageUrl,
        alt: slide.alt,
        onPress:
          slide.linkKind !== "none" && slide.linkUrl
            ? () => openBannerLink(router, slide.linkKind, slide.linkUrl)
            : undefined,
      }))}
    />
  );
}
