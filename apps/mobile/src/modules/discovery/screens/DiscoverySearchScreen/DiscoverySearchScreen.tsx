"use client";

import { Button } from "@heroui/react/button";
import { SearchField } from "@heroui/react/search-field";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Gear1 } from "@repo/icons/Gear1";
import { SliderDotThreeHorizontal } from "@repo/icons/SliderDotThreeHorizontal";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { roleAppPath } from "@/shared/lib/role-routes";
import { useAuth } from "@/shared/providers/AuthProvider";
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

  const topics = useMemo(
    () =>
      filterDiscoverySearchTopics(
        DISCOVERY_SEARCH_TOPICS,
        query,
        selectedTopicId,
      ),
    [query, selectedTopicId],
  );

  const users = useMemo(
    () =>
      filterDiscoverySearchUsers(
        DISCOVERY_SEARCH_USERS,
        query,
        selectedTopicId,
      ),
    [query, selectedTopicId],
  );

  const updateQuery = (value: string) => {
    setQuery(value);
    setSelectedTopicId(topicIdForQuery(DISCOVERY_SEARCH_TOPICS, value));
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

  const toggleFollow = (user: DiscoverySearchUser) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setFollowingIds((current) => {
      const next = new Set(current);
      if (next.has(user.id)) next.delete(user.id);
      else next.add(user.id);
      return next;
    });
  };

  return (
    <AppLayout
      className={slots.root({ className })}
      header={
        <Header
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
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("pageTitle")}
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
