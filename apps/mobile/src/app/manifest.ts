import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-static";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations("Metadata");

  return {
    name: "Gym4Me",
    short_name: "Gym4Me",
    description: t("description"),
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#1fff6f",
    theme_color: "#1fff6f",
    lang: "fa",
    dir: "rtl",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
