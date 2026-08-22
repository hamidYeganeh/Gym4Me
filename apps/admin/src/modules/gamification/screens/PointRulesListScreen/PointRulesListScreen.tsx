import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminPointRule, EntityStatus, PointRuleEvent } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { PointRulesListArchiveDialogSection } from "../../sections/PointRulesListArchiveDialogSection";
import { PointRulesListHeaderSection } from "../../sections/PointRulesListHeaderSection";
import { PointRulesListTableSection } from "../../sections/PointRulesListTableSection";
import { pointRulesListScreenVariants } from "./PointRulesListScreen.styles";
import type { PointRulesListScreenProps } from "./PointRulesListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["event", "status"] as const;

type PointRulesListFilters = {
  event: PointRuleEvent | "all";
  status: EntityStatus | "all";
};

const FILTER_DEFAULTS: PointRulesListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  event: "all",
  status: "all",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function PointRulesListScreen({ className }: PointRulesListScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const navigate = useNavigate();
  const styles = pointRulesListScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<PointRulesListFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [archiving, setArchiving] = useState<AdminPointRule | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, pageSize }),
    [filters, pageSize],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminGamification.listPointRules({
        page: nextPage,
        page_size: nextPageSize,
        event: filters.event === "all" ? undefined : filters.event,
        status: filters.status === "all" ? undefined : filters.status,
      });
    },
    [filters],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<AdminPointRule>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const visibleItems = useMemo(() => {
    const term = search.trim();
    if (!term) return items;
    return items.filter((item) => item.title.includes(term));
  }, [items, search]);

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminGamification.archivePointRule(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{
        activeTabId: "rules",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <PointRulesListHeaderSection
          eventFilter={filters.event}
          statusFilter={filters.status}
          onCreate={() => navigate(routes.pointRuleNew)}
          onEventChange={(value) => setFilter("event", value)}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("status", value)}
        />

        <PointRulesListTableSection
          error={error}
          items={visibleItems}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onArchive={(row) => {
            setArchiving(row);
            setArchiveError(null);
          }}
          onEdit={(row) => navigate(routes.pointRuleEdit(row.id))}
          onPageChange={changePage}
        />
      </div>

      <PointRulesListArchiveDialogSection
        archiveError={archiveError}
        archivePending={archivePending}
        archiving={archiving}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
