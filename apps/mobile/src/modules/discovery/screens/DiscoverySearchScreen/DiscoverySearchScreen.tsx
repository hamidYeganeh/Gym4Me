"use client";

import { Button } from "@heroui/react/button";
import { SearchField } from "@heroui/react/search-field";
import { Gear1 } from "@repo/icons/Gear1";
import { SliderDotThreeHorizontal } from "@repo/icons/SliderDotThreeHorizontal";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import { useEffect, useMemo, useState } from "react";
import { roleAppPath } from "@/shared/lib/role-routes";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  accountSocial,
  discoveryCoaches,
  mediaFileUrl,
} from "@/shared/lib/api";
import {
  DISCOVERY_SEARCH_TOPICS,
  DISCOVERY_SEARCH_USERS,
  filterDiscoverySearchTopics,
  filterDiscoverySearchUsers,
  topicIdForQuery,
  type DiscoverySearchTopic,
  type DiscoverySearchUser,
} from "../../lib/discovery-search-data";
import { DiscoverySearchTopicsSection } from "../../sections/DiscoverySearchTopicsSection";
import { DiscoverySearchUsersSection } from "../../sections/DiscoverySearchUsersSection";
import { discoverySearchScreenVariants } from "./DiscoverySearchScreen.styles";
import type { DiscoverySearchScreenProps } from "./DiscoverySearchScreen.types";

const SEARCH_TOPICS = DISCOVERY_SEARCH_TOPICS;

export function DiscoverySearchScreen({
  className,
}: DiscoverySearchScreenProps) {
  const t = useTranslations("DiscoverySearch");
  const router = useRouter();
  const { isAuthenticated, activeRole } = useAuth();
  const slots = discoverySearchScreenVariants();

  const [query, setQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [remoteUsers, setRemoteUsers] = useState<DiscoverySearchUser[]>(
    DEMO_MODE ? DISCOVERY_SEARCH_USERS : [],
  );

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await discoveryCoaches.list({
          page_size: 20,
          ...(query.trim() ? { q: query.trim() } : {}),
        });
        if (cancelled) return;
        setRemoteUsers(
          response.result.map((coach) => ({
            id: coach.userId,
            name:
              [coach.user.name.first, coach.user.name.last]
                .filter(Boolean)
                .join(" ") || t("coachFallback"),
            image: mediaFileUrl(coach.user.avatar.mediaId) ?? "",
            joinedYear: new Date(coach.createdAt).getFullYear(),
            topicIds: [],
          })),
        );
      } catch {
        if (!cancelled) setRemoteUsers([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, t]);

  useEffect(() => {
    if (!isAuthenticated || DEMO_MODE) return;
    let cancelled = false;
    void accountSocial
      .listFollowing({ page_size: 100, followeeKind: "user" })
      .then((page) => {
        if (!cancelled) {
          setFollowingIds(new Set(page.result.map((item) => item.followeeId)));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const topics = useMemo(
    () => filterDiscoverySearchTopics(SEARCH_TOPICS, query, selectedTopicId),
    [query, selectedTopicId],
  );

  const users = useMemo(
    () =>
      filterDiscoverySearchUsers(
        remoteUsers,
        query,
        DEMO_MODE ? selectedTopicId : null,
      ),
    [query, remoteUsers, selectedTopicId],
  );

  const updateQuery = (value: string) => {
    setQuery(value);
    setSelectedTopicId(topicIdForQuery(SEARCH_TOPICS, value));
  };

  const openFilters = () => {
    const trimmed = query.trim();
    router.push(
      trimmed
        ? `/discovery/coaches?q=${encodeURIComponent(trimmed)}`
        : "/discovery/coaches",
    );
  };

  const selectTopic = (topic: DiscoverySearchTopic) => {
    if (selectedTopicId === topic.id) {
      setSelectedTopicId(null);
      setQuery("");
      return;
    }
    setSelectedTopicId(topic.id);
    setQuery(topic.label);
  };

  const openUser = (user: DiscoverySearchUser) => {
    router.push(`/discovery/coaches/${user.id}`);
  };

  const toggleFollow = async (user: DiscoverySearchUser) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    const wasFollowing = followingIds.has(user.id);
    setFollowingIds((current) => {
      const next = new Set(current);
      if (wasFollowing) next.delete(user.id);
      else next.add(user.id);
      return next;
    });
    if (DEMO_MODE) return;
    try {
      const input = { followeeId: user.id, followeeKind: "user" as const };
      if (wasFollowing) await accountSocial.unfollow(input);
      else await accountSocial.follow(input);
    } catch {
      setFollowingIds((current) => {
        const next = new Set(current);
        if (wasFollowing) next.add(user.id);
        else next.delete(user.id);
        return next;
      });
    }
  };

  return (
    <AppLayout
      className={slots.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
          title={t("pageTitle")}
          endContent={
            <Button
              aria-label={t("settingsAria")}
              isIconOnly
              onPress={() =>
                router.push(
                  isAuthenticated
                    ? roleAppPath(activeRole, "profile")
                    : "/auth/login",
                )
              }
              size="lg"
              variant="ghost"
            >
              <Gear1 className="text-foreground" size={22} />
            </Button>
          }
        />
      }
    >
      <div className={slots.content()}>
        <SearchField
          aria-label={t("searchAria")}
          autoComplete="off"
          autoFocus
          className={slots.searchField()}
          fullWidth
          name="discovery-search"
          value={query}
          variant="secondary"
          onChange={updateQuery}
          onSubmit={updateQuery}
        >
          <SearchField.Group className={slots.searchGroup()}>
            <SearchField.SearchIcon />
            <SearchField.Input
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder={t("placeholder")}
              spellCheck={false}
            />
            <SearchField.ClearButton />
            <Button
              aria-label={t("filterAria")}
              className={slots.filterButton()}
              isIconOnly
              onPress={openFilters}
              size="lg"
              variant="ghost"
            >
              <SliderDotThreeHorizontal size={20} />
            </Button>
          </SearchField.Group>
        </SearchField>

        <DiscoverySearchTopicsSection
          emptyLabel={t("emptyTopics")}
          selectedTopicId={selectedTopicId}
          title={t("topicsTitle")}
          topicAria={(topic) => t("topicAria", { topic })}
          topics={topics}
          onSelect={selectTopic}
        />

        <DiscoverySearchUsersSection
          emptyLabel={t("emptyUsers")}
          followAria={(name) => t("followAria", { name })}
          followLabel={t("follow")}
          followingIds={followingIds}
          followingLabel={t("following")}
          joinedLabel={(year) =>
            t("joined", {
              year: year.toLocaleString("fa-IR", { useGrouping: false }),
            })
          }
          openUserAria={(name) => t("openUserAria", { name })}
          title={t("usersTitle")}
          unfollowAria={(name) => t("unfollowAria", { name })}
          users={users}
          onFollow={toggleFollow}
          onOpen={openUser}
        />
      </div>
    </AppLayout>
  );
}
