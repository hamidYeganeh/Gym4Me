import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SplashContinue } from "@/modules/app/screens/SplashScreen/SplashContinue";
import { SplashScreen } from "@/modules/app/screens/SplashScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Splash");
  return { title: t("title") };
}

export default async function SplashPage() {
  const t = await getTranslations("Splash");
  // In local/dev, unauthenticated users can still reach the gallery.
  const guestHref =
    process.env.NODE_ENV === "development" ? "/dev" : "/auth/sign-in";

  return (
    <>
      <SplashContinue guestHref={guestHref} />
      <SplashScreen
        brand={t("brand")}
        taglines={[
          t("taglineTrain"),
          t("taglineRecover"),
          t("taglineRepeat"),
        ]}
      />
    </>
  );
}
