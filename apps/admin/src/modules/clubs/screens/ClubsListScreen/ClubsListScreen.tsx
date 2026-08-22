import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Club, ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { routes } from "@/shared/lib/routes";
import { isClubsMockMode } from "../../lib/clubs-repository";
import { listClubs } from "../../lib/clubs-repository";
import type { ClubListQuery } from "../../lib/clubs-data";
import { ClubsListFiltersSection } from "../../sections/ClubsListFiltersSection";
import { ClubsListHeaderSection } from "../../sections/ClubsListHeaderSection";
import { ClubsListTableSection } from "../../sections/ClubsListTableSection";
import { clubsListScreenVariants } from "./ClubsListScreen.styles";
import type { ClubsListScreenProps } from "./ClubsListScreen.types";

const PAGE_SIZE = 20;
const FILTER_KEYS = ["lifecycleStatus", "operationalStatus"] as const;
const FILTER_DEFAULTS: ClubsListFilters & { search: string } = {
  lifecycleStatus: [],
  operationalStatus: [],
  search: "",
};

type ClubsListFilters = {
  lifecycleStatus: ClubLifecycleStatus[];
  operationalStatus: ClubOperationalStatus[];
};

export function ClubsListScreen({ className }: ClubsListScreenProps) {
  const t = useTranslations("Admin.Clubs");
  const navigate = useNavigate();
  const styles = clubsListScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    sortBy,
    sortOrder,
    sort,
    setSort,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<
    ClubsListFilters,
    NonNullable<ClubListQuery["sortBy"]>
  >({
      filterKeys: FILTER_KEYS,
      defaults: { ...FILTER_DEFAULTS, page: 1, page_size: PAGE_SIZE },
      defaultSort: { column: "createdAt", direction: "descending" },
    });

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search,
        lifecycleStatus: filters.lifecycleStatus,
        operationalStatus: filters.operationalStatus,
        sortBy,
        sortOrder,
        pageSize,
      }),
    [
      filters.lifecycleStatus,
      filters.operationalStatus,
      pageSize,
      search,
      sortBy,
      sortOrder,
    ],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return listClubs({
        page: nextPage,
        limit: nextPageSize,
        search: search || undefined,
        lifecycleStatus:
          filters.lifecycleStatus.length === 0
            ? undefined
            : filters.lifecycleStatus,
        operationalStatus:
          filters.operationalStatus.length === 0
            ? undefined
            : filters.operationalStatus,
        sortBy,
        sortOrder,
      });
    },
    [
      filters.lifecycleStatus,
      filters.operationalStatus,
      search,
      sortBy,
      sortOrder,
    ],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<Club>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

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
          onCreate={() => navigate(routes.clubsNew)}
          onRefresh={() => void reload()}
        />

        <ClubsListTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          sort={sort}
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
          totalPages={totalPages}
          onPageChange={changePage}
          onSortChange={setSort}
          onView={(clubId) => navigate(routes.club(clubId))}
        />
      </div>
    </AdminShell>
  );
}
