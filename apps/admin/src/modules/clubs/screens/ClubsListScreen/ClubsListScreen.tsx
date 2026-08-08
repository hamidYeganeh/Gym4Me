import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Club, ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminInfiniteQuery,
  useAdminListQueryParams,
} from "@/shared/hooks";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { routes } from "@/shared/lib/routes";
import { ClubsCreateForm } from "../../components/ClubsCreateForm";
import type { ClubsCreateFormValues } from "../../components/ClubsCreateForm";
import { isClubsMockMode } from "../../lib/clubs-repository";
import { createClub, listClubs } from "../../lib/clubs-repository";
import { ClubsListFiltersSection } from "../../sections/ClubsListFiltersSection";
import { ClubsListHeaderSection } from "../../sections/ClubsListHeaderSection";
import { ClubsListTableSection } from "../../sections/ClubsListTableSection";
import { clubsListScreenVariants } from "./ClubsListScreen.styles";
import type { ClubsListScreenProps } from "./ClubsListScreen.types";

const PAGE_SIZE = 20;
const FILTER_KEYS = ["lifecycleStatus", "operationalStatus"] as const;
const FILTER_DEFAULTS = {
  lifecycleStatus: "all",
  operationalStatus: "all",
  search: "",
} as const;

type ClubsListFilters = {
  lifecycleStatus: ClubLifecycleStatus | "all";
  operationalStatus: ClubOperationalStatus | "all";
};

export function ClubsListScreen({ className }: ClubsListScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const navigate = useNavigate();
  const styles = clubsListScreenVariants();
  const [createOpen, setCreateOpen] = useState(false);

  const { search, searchInput, setSearchInput, filters, setFilter } =
    useAdminListQueryParams<ClubsListFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search,
        lifecycleStatus: filters.lifecycleStatus,
        operationalStatus: filters.operationalStatus,
        pageSize: PAGE_SIZE,
      }),
    [filters.lifecycleStatus, filters.operationalStatus, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return listClubs({
        page,
        limit: pageSize,
        q: search || undefined,
        lifecycleStatus:
          filters.lifecycleStatus === "all"
            ? undefined
            : filters.lifecycleStatus,
        operationalStatus:
          filters.operationalStatus === "all"
            ? undefined
            : filters.operationalStatus,
      });
    },
    [filters.lifecycleStatus, filters.operationalStatus, search],
  );

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<Club>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const handleCreate = async (
    values: ClubsCreateFormValues,
    intent: FormSubmitIntent,
  ) => {
    const club = await createClub({
      ownerId: values.ownerId.trim(),
      identity: {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      },
      contact: {
        phones: [
          {
            number: values.phone.trim(),
            label: values.phoneLabel.trim() || undefined,
          },
        ],
        website: values.website.trim() || undefined,
      },
      location: {
        address: values.address.trim(),
        direction: values.direction,
      },
      categoryIds: values.categoryIds,
      sportIds: values.sportIds,
      audience: {
        genderPolicy: values.genderPolicy || null,
        accessibility: values.accessibility || "standard",
        ageGroupKeys: values.ageGroupKeys,
        levelKeys: values.levelKeys,
      },
    });

    if (intent === "saveAndCreateNew") {
      void reload();
      return;
    }

    setCreateOpen(false);
    navigate(routes.club(club.id));
  };

  return (
    <AdminShell
      activeNavId="clubs"
      className={className}
      clubsSection={{
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <ClubsListHeaderSection
          usingMock={isClubsMockMode()}
          onCreate={() => setCreateOpen(true)}
          onRefresh={() => void reload()}
        />

        <ClubsListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          toolbar={
            <ClubsListFiltersSection
              lifecycleStatus={filters.lifecycleStatus}
              operationalStatus={filters.operationalStatus}
              onLifecycleChange={(value) =>
                setFilter("lifecycleStatus", value)
              }
              onOperationalChange={(value) =>
                setFilter("operationalStatus", value)
              }
            />
          }
          total={total}
          onLoadMore={loadMore}
          onView={(clubId) => navigate(routes.club(clubId))}
        />
      </div>

      <ClubsCreateForm
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </AdminShell>
  );
}
