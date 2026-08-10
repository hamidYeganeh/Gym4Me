import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SignInScreen } from "@/modules/auth/screens/SignInScreen";
import { RequireAuth } from "@/shared/components/RequireAuth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Auth");
  return { title: t("title") };
}

export default function AuthLoginPage() {
  return (
    <RequireAuth guestOnly>
      <Suspense fallback={null}>
        <SignInScreen />
      </Suspense>
    </RequireAuth>
  );
}
