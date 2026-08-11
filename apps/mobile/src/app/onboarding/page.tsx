import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { OnboardingScreen } from "@/modules/app/screens/OnboardingScreen";
import { RequireAuth } from "@/shared/components/RequireAuth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Onboarding");
  return { title: t("title") };
}

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <OnboardingScreen />
      </Suspense>
    </RequireAuth>
  );
}
