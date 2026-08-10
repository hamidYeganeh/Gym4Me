import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SetPasswordScreen } from "@/modules/auth/screens/SetPasswordScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.SetPassword");
  return { title: t("title") };
}

export default function Page() {
  return <SetPasswordScreen roleSegment="athlete" />;
}
