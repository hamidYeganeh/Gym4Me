import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  OWNER_MEMBERS,
  OWNER_MEMBERS_STATS,
} from "@/modules/owner/lib/owner-members-data";
import { OwnerMembersScreen } from "@/modules/owner/screens/OwnerMembersScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnerMembers");
  return { title: t("pageTitle") };
}

export default function OwnerMembersPage() {
  return (
    <OwnerMembersScreen members={OWNER_MEMBERS} stats={OWNER_MEMBERS_STATS} />
  );
}
