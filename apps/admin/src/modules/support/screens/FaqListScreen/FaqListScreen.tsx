import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminFaqItem, FaqAudience, PublishStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminSupport } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { FaqListDeleteDialogSection } from "../../sections/FaqListDeleteDialogSection";
import { FaqListHeaderSection } from "../../sections/FaqListHeaderSection";
import { FaqListTableSection } from "../../sections/FaqListTableSection";
import { faqListScreenVariants } from "./FaqListScreen.styles";
import type { FaqListScreenProps } from "./FaqListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["publishStatus", "audience"] as const;

type FaqListFilters = {
  publishStatus: PublishStatus | "all";
  audience: FaqAudience | "any";
};

const FILTER_DEFAULTS: FaqListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  publishStatus: "all",
  audience: "any",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function FaqListScreen({ className }: FaqListScreenProps) {
  const t = useTranslations("Admin.Support");
  const navigate = useNavigate();
  const styles = faqListScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<FaqListFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [deleting, setDeleting] = useState<AdminFaqItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, search, pageSize }),
    [filters, pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminSupport.listFaq({
        page: nextPage,
        page_size: nextPageSize,
        publishStatus:
          filters.publishStatus === "all" ? undefined : filters.publishStatus,
        audience: filters.audience === "any" ? undefined : filters.audience,
        search: search.trim() || undefined,
      });
    },
    [filters, search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<AdminFaqItem>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await adminSupport.deleteFaq(deleting.id);
      setDeleting(null);
      void reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="support"
      className={className}
      supportSection={{
        activeTabId: "faq",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <FaqListHeaderSection
          audienceFilter={filters.audience}
          statusFilter={filters.publishStatus}
          onAudienceChange={(value) => setFilter("audience", value)}
          onCreate={() => navigate(routes.supportFaqNew)}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("publishStatus", value)}
        />

        <FaqListTableSection
          error={error}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onDelete={(row) => {
            setDeleting(row);
            setDeleteError(null);
          }}
          onEdit={(row) => navigate(routes.supportFaqEdit(row.id))}
          onPageChange={changePage}
        />
      </div>

      <FaqListDeleteDialogSection
        deleteError={deleteError}
        deletePending={deletePending}
        deleting={deleting}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}
