import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { OtpScreen } from "@/modules/auth/screens/OtpScreen";
import { RequireAuth } from "@/shared/components/RequireAuth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.Otp");
  return { title: t("title") };
}

export default function OtpPage() {
  return (
    <RequireAuth guestOnly>
      <Suspense fallback={null}>
        <OtpScreen />
      </Suspense>
    </RequireAuth>
  );
}
