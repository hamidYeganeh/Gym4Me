import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RoleApplyScreen } from "@/modules/account/screens/RoleApplyScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.RoleApply");
  return { title: t("title") };
}

export default function Page() {
  return <RoleApplyScreen roleSegment="owner" />;
}
