import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RoleRequestWizardScreen } from "@/modules/account/screens/RoleRequestWizardScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Mobile.RoleApply");
  return { title: t("wizardCoachTitle") };
}

export default function Page() {
  return <RoleRequestWizardScreen role="coach" roleSegment="owner" />;
}
