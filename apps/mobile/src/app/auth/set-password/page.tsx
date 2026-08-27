import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthSetPasswordScreen } from "@/modules/auth/screens/AuthSetPasswordScreen";
import { RequireAuth } from "@/shared/components/RequireAuth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.SetPassword");
  return { title: t("title") };
}

export default function AuthSetPasswordPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <AuthSetPasswordScreen />
      </Suspense>
    </RequireAuth>
  );
}
