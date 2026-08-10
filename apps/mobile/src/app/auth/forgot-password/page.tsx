import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordScreen } from "@/modules/auth/screens/ForgotPasswordScreen";
import { RequireAuth } from "@/shared/components/RequireAuth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.ForgotPassword");
  return { title: t("steps.phone.title") };
}

export default function ForgotPasswordPage() {
  return (
    <RequireAuth guestOnly>
      <Suspense fallback={null}>
        <ForgotPasswordScreen />
      </Suspense>
    </RequireAuth>
  );
}
