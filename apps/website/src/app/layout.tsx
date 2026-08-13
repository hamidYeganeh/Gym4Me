import type { Metadata, Viewport } from "next";
import { iranSansX } from "@repo/fonts/iran-sans-x";
import { ThemeProvider } from "@repo/theme";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AppProviders } from "@/shared/providers/AppProviders";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MarketingLanding");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://gym4me.ir";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("metaTitle"),
      template: "%s | Gym4Me",
    },
    description: t("metaDescription"),
    applicationName: "Gym4Me",
    authors: [{ name: "Gym4Me" }],
    creator: "Gym4Me",
    publisher: "Gym4Me",
    keywords: ["Gym4Me", "gym", "fitness", "باشگاه", "مربی", "ورزشکار"],
    icons: {
      icon: [
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { url: "/logo.svg", type: "image/svg+xml" },
        {
          url: "/assets/images/favicons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/assets/images/favicons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/apple-icon",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      other: [
        {
          rel: "mask-icon",
          url: "/assets/images/favicons/safari-pinned-tab.svg",
          color: "#1fff6f",
        },
      ],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      siteName: "Gym4Me",
      title: t("metaTitle"),
      description: t("metaDescription"),
      locale: "fa_IR",
      images: [
        {
          url: "/assets/images/og-image.png",
          width: 1200,
          height: 630,
          alt: t("metaTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: ["/assets/images/og-image.png"],
    },
    appleWebApp: {
      title: "Gym4Me",
      capable: true,
      statusBarStyle: "default",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f1f" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir="rtl"
      className={`${iranSansX.variable} is-loading`}
      data-header-theme="blue"
      suppressHydrationWarning
    >
      <head>
        {/* Quarantined legacy marketing CSS — see public/assets/LEGACY.md */}
        <link id="main-css" rel="stylesheet" href="/assets/styles/main.css" />
        <link rel="stylesheet" href="/assets/styles/theme-bridge.css" />
      </head>
      <body
        data-module-load=""
        className={`${iranSansX.className} antialiased`}
      >
        <ThemeProvider>
          <NextIntlClientProvider>
            <AppProviders>{children}</AppProviders>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
