import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ListAdminUsersQuery, PublicUser, Role, UserStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminUsers } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { UsersListFiltersSection } from "../../sections/UsersListFiltersSection";
import { UsersListHeaderSection } from "../../sections/UsersListHeaderSection";
import { UsersListTableSection } from "../../sections/UsersListTableSection";
import { usersListScreenVariants } from "./UsersListScreen.styles";
import type { UsersListScreenProps } from "./UsersListScreen.types";

const PAGE_SIZE = 20;
const FILTER_KEYS = ["status", "role"] as const;
const FILTER_DEFAULTS: UsersListFilters & { search: string } = {
  status: [],
  role: "all",
  search: "",
};

type UsersListFilters = {
  status: UserStatus[];
  role: Role | "all";
};

export function UsersListScreen({ className }: UsersListScreenProps) {
  const t = useTranslations("Admin.Users");
  const navigate = useNavigate();
  const styles = usersListScreenVariants();

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
  } = useAdminListQueryParams<
    UsersListFilters,
    NonNullable<ListAdminUsersQuery["sortBy"]>
  >({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
      defaultSort: { column: "createdAt", direction: "descending" },
    });

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search,
        status: filters.status,
        role: filters.role,
        sortBy,
        sortOrder,
        pageSize: PAGE_SIZE,
      }),
    [filters.role, filters.status, search, sortBy, sortOrder],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminUsers.list({
        page,
        limit: pageSize,
        search: search || undefined,
        status: filters.status.length > 0 ? filters.status : undefined,
        role: filters.role === "all" ? undefined : filters.role,
        sortBy,
        sortOrder,
      });
    },
    [filters.role, filters.status, search, sortBy, sortOrder],
  );

  const {
    items,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    setPage,
    reload,
  } = useAdminPaginatedQuery<PublicUser>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  return (
    <AdminShell
      activeNavId="users"
      className={className}
      usersSection={{
        activeTabId: "users",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <UsersListHeaderSection
          onCreate={() => navigate(routes.usersNew)}
          onRefresh={() => void reload()}
        />

        <UsersListTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          sort={sort}
          toolbar={
            <UsersListFiltersSection
              role={filters.role}
              status={filters.status}
              onRoleChange={(value) => setFilter("role", value)}
              onStatusChange={(value) => setFilter("status", value)}
            />
          }
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onSortChange={setSort}
          onView={(userId) => navigate(routes.user(userId))}
        />
      </div>
    </AdminShell>
  );
}
