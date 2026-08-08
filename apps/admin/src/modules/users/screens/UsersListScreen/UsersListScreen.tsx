import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PublicUser, Role, UserStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminInfiniteQuery,
  useAdminListQueryParams,
} from "@/shared/hooks";
import type { FormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { adminUsers } from "@/shared/lib/api";
import { UsersCreateForm } from "../../components/UsersCreateForm";
import type { UsersCreateFormValues } from "../../components/UsersCreateForm";
import { UsersListFiltersSection } from "../../sections/UsersListFiltersSection";
import { UsersListHeaderSection } from "../../sections/UsersListHeaderSection";
import { UsersListTableSection } from "../../sections/UsersListTableSection";
import { usersListScreenVariants } from "./UsersListScreen.styles";
import type { UsersListScreenProps } from "./UsersListScreen.types";

const PAGE_SIZE = 20;
const FILTER_KEYS = ["status", "role"] as const;
const FILTER_DEFAULTS = {
  status: "all",
  role: "all",
  search: "",
} as const;

type UsersListFilters = {
  status: UserStatus | "all";
  role: Role | "all";
};

export function UsersListScreen({ className }: UsersListScreenProps) {
  const t = useTranslations("Admin.Users");
  const navigate = useNavigate();
  const styles = usersListScreenVariants();
  const [createOpen, setCreateOpen] = useState(false);

  const { search, searchInput, setSearchInput, filters, setFilter } =
    useAdminListQueryParams<UsersListFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search,
        status: filters.status,
        role: filters.role,
        pageSize: PAGE_SIZE,
      }),
    [filters.role, filters.status, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminUsers.list({
        page,
        limit: pageSize,
        search: search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        role: filters.role === "all" ? undefined : filters.role,
      });
    },
    [filters.role, filters.status, search],
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
  } = useAdminInfiniteQuery<PublicUser>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const handleCreate = async (
    values: UsersCreateFormValues,
    intent: FormSubmitIntent,
  ) => {
    const user = await adminUsers.create({
      phone: values.phone.trim(),
      firstName: values.firstName.trim() || undefined,
      lastName: values.lastName.trim() || undefined,
      password: values.password || undefined,
      roles: values.roles,
    });

    if (intent === "saveAndCreateNew") {
      void reload();
      return;
    }

    setCreateOpen(false);
    navigate(`/dashboard/users/${user.id}`);
  };

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
          onCreate={() => setCreateOpen(true)}
          onRefresh={() => void reload()}
        />

        <UsersListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          toolbar={
            <UsersListFiltersSection
              role={filters.role}
              status={filters.status}
              onRoleChange={(value) => setFilter("role", value)}
              onStatusChange={(value) => setFilter("status", value)}
            />
          }
          total={total}
          onLoadMore={loadMore}
          onView={(userId) => navigate(`/dashboard/users/${userId}`)}
        />
      </div>

      <UsersCreateForm
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </AdminShell>
  );
}
