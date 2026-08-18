"use client";

import { AppLayout } from "@repo/ui/layout/AppLayout";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mediaFileUrl } from "@/shared/lib/api";
import { roleAppPath, roleSegment } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CommunityFeedSection } from "../../sections/CommunityFeedSection";
import { CommunityHomeHeaderSection } from "../../sections/CommunityHomeHeaderSection";
import { CommunityStoriesSection } from "../../sections/CommunityStoriesSection";
import { communityHomeScreenStyles as styles } from "./CommunityHomeScreen.styles";
import type { CommunityHomeScreenProps } from "./CommunityHomeScreen.types";

export function CommunityHomeScreen({
  members,
  posts,
  isPro = false,
  isFeedLoading = false,
  pendingId,
  onLike,
  onSave,
  className,
}: CommunityHomeScreenProps) {
  const t = useTranslations("CommunityHome");
  const router = useRouter();
  const { user, activeRole } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const isAthlete = roleSegment(activeRole) === "athlete";
  const firstName = user?.name.first?.trim() || t("fallbackName");
  const query = searchValue.trim().toLocaleLowerCase("fa");
  const visibleMembers =
    query.length === 0
      ? members
      : members.filter((member) =>
          member.username.toLocaleLowerCase("fa").includes(query),
        );

  return (
    <AppLayout
      className={[styles.root, className].filter(Boolean).join(" ")}
      header={
        <CommunityHomeHeaderSection
          avatarSrc={mediaFileUrl(user?.avatar.mediaId) ?? undefined}
          firstName={firstName}
          isPro={isPro}
          isSearchOpen={isSearchOpen}
          searchValue={searchValue}
          onNotificationPress={() =>
            router.push(roleAppPath(activeRole, "notifications"))
          }
          onSearchChange={setSearchValue}
          onSearchPress={() => {
            setIsSearchOpen((open) => {
              if (open) setSearchValue("");
              return !open;
            });
          }}
        />
      }
    >
      <div className={styles.content}>
        <CommunityStoriesSection members={visibleMembers} />
        <CommunityFeedSection
          canCreate={isAthlete}
          isLoading={isFeedLoading}
          pendingId={pendingId}
          posts={posts}
          onCreatePress={() => router.push("/athlete/social/create")}
          onLike={onLike}
          onPostPress={
            isAthlete
              ? (postId) => router.push(`/athlete/social/${postId}`)
              : undefined
          }
          onSave={onSave}
        />
      </div>
    </AppLayout>
  );
}
