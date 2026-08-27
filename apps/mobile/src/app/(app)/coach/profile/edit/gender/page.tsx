import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ProfileGenderScreen } from "@/modules/account/screens/ProfileGenderScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.ProfileSettings");
  return { title: t("editGenderTitle") };
}

export default function Page() {
  return (
    <Suspense>
      <ProfileGenderScreen roleSegment="coach" />
    </Suspense>
  );
}
