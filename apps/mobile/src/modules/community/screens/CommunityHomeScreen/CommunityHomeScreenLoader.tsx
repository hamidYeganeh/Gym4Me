"use client";

import { useCommunityHome } from "../../lib/use-community-home";
import { CommunityHomeScreen } from "./CommunityHomeScreen";

export function CommunityHomeScreenLoader() {
  const community = useCommunityHome();

  return (
    <CommunityHomeScreen
      isFeedLoading={community.isFeedLoading}
      isPro={community.isPro}
      members={community.members}
      pendingId={community.pendingId}
      posts={community.posts}
      onLike={community.handleLike}
      onSave={community.handleSave}
    />
  );
}
