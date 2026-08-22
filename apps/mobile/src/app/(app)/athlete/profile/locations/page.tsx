import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ProfileLocationsScreen } from "@/modules/account/screens/ProfileLocationsScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.ProfileLocations");
  return { title: t("title") };
}

export default function Page() {
  return (
    <Suspense>
      <ProfileLocationsScreen roleSegment="athlete" />
    </Suspense>
  );
}
