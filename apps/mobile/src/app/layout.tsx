import type { Metadata, Viewport } from "next";
import { iranSansX } from "@repo/fonts/iran-sans-x";
import { roboto } from "@repo/fonts/roboto";
import { ThemeProvider } from "@repo/theme";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { CapacitorProvider } from "@/shared/components/capacitor-provider";
import { AppProviders } from "@/shared/providers/AppProviders";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f1f" },
  ],
  colorScheme: "light dark",
  /** Required for `env(safe-area-inset-*)` on iOS Capacitor / PWA */
  viewportFit: "cover",
  /** Let the layout viewport shrink with the soft keyboard (Android Chrome / WK). */
  interactiveWidget: "resizes-content",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: {
      default: "Gym4Me",
      template: "%s | Gym4Me",
    },
    description: t("description"),
    applicationName: "Gym4Me",
    authors: [{ name: "Gym4Me" }],
    creator: "Gym4Me",
    publisher: "Gym4Me",
    keywords: ["Gym4Me", "gym", "fitness", "باشگاه"],
    icons: {
      icon: [
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { url: "/logo.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      siteName: "Gym4Me",
      title: "Gym4Me",
      description: t("description"),
      locale: "fa_IR",
    },
    twitter: {
      card: "summary",
      title: "Gym4Me",
      description: t("description"),
    },
    appleWebApp: {
      title: "Gym4Me",
      capable: true,
      statusBarStyle: "black-translucent",
    },
  };
}

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
      className={`${iranSansX.variable} ${roboto.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${iranSansX.className} min-h-full bg-background text-foreground antialiased`}
      >
        <div className="relative mx-auto min-h-full w-full max-w-xl">
          <ThemeProvider>
            <CapacitorProvider />
            <NextIntlClientProvider>
              <AppProviders>{children}</AppProviders>
            </NextIntlClientProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
