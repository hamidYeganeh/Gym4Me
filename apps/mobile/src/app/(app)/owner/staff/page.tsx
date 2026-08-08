import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  OWNER_STAFF,
  OWNER_STAFF_GRANT_LABELS,
} from "@/modules/owner/lib/owner-staff-data";
import { OwnerStaffScreen } from "@/modules/owner/screens/OwnerStaffScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerStaff");
  return { title: t("pageTitle") };
}

export default function OwnerStaffPage() {
  return (
    <OwnerStaffScreen
      grantLabels={OWNER_STAFF_GRANT_LABELS}
      staff={OWNER_STAFF}
    />
  );
}
