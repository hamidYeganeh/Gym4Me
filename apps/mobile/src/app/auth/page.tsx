import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthSelectScreen } from "@/modules/auth/screens/AuthSelectScreen";
import { RequireAuth } from "@/shared/components/RequireAuth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Auth");
  return { title: t("selectTitle") };
}

export default function AuthPage() {
  return (
    <RequireAuth guestOnly>
      <Suspense fallback={null}>
        <AuthSelectScreen />
      </Suspense>
    </RequireAuth>
  );
}
