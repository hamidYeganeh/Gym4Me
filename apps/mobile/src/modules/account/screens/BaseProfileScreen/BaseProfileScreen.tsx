"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { formatMemberSince } from "@/modules/account/lib/profile-demographics";
import { BaseProfileHeroSection } from "../../sections/BaseProfileHeroSection";
import { BaseProfileIdentitySection } from "../../sections/BaseProfileIdentitySection";
import { BaseProfilePostsSection } from "../../sections/BaseProfilePostsSection";
import { mediaFileUrl } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { baseProfileScreenVariants } from "./BaseProfileScreen.styles";
import type { BaseProfileScreenProps } from "./BaseProfileScreen.types";

export function BaseProfileScreen({
  className,
  roleSegment = "athlete",
}: BaseProfileScreenProps) {
  const t = useTranslations("Mobile.Profile");
  const tRole = useTranslations("Mobile.RoleApply");
  const styles = baseProfileScreenVariants();
  const router = useRouter();
  const { user, activeRole } = useAuth();

  const displayName = useMemo(() => {
    const parts = [user?.name.first, user?.name.last].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.code ?? t("title");
  }, [t, user]);

  const activeRoleLabel = useMemo(() => {
    if (activeRole === "coach") return tRole("coach");
    if (activeRole === "club_owner") return tRole("owner");
    return tRole("athlete");
  }, [activeRole, tRole]);

  const memberSince = formatMemberSince(user?.createdAt);
  const avatarSrc = mediaFileUrl(user?.avatar.mediaId);
  const showKycCta =
    user?.kyc.status === "none" || user?.kyc.status === "rejected";

  const path = (suffix: string) => `/${roleSegment}/profile/${suffix}`;

  return (
    <AppLayout className={styles.root({ className })}>
      <div className={styles.content()}>
        <BaseProfileHeroSection
          avatarSrc={avatarSrc}
          displayName={displayName}
          roleSegment={roleSegment}
          onAnalyticsPress={() => router.push(`/${roleSegment}`)}
          onEditPress={() => router.push(path("edit"))}
          onSettingsPress={() => router.push(`/${roleSegment}/settings`)}
        />

        <BaseProfileIdentitySection
          activeRoleLabel={activeRoleLabel}
          displayName={displayName}
          memberSince={memberSince}
          showKycCta={showKycCta}
          onHelpPress={() => router.push(path("help"))}
          onKycPress={() => router.push(`/${roleSegment}/kyc`)}
        />

        <BaseProfilePostsSection
          roleSegment={roleSegment}
          onCreatePost={() => {
            if (roleSegment === "athlete") {
              router.push("/athlete/social/create");
            }
          }}
        />
      </div>
    </AppLayout>
  );
}
