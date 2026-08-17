import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminFaqItem, PublishStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminSupport } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { FaqListDeleteDialogSection } from "../../sections/FaqListDeleteDialogSection";
import { FaqListHeaderSection } from "../../sections/FaqListHeaderSection";
import { FaqListTableSection } from "../../sections/FaqListTableSection";
import { faqListScreenVariants } from "./FaqListScreen.styles";
import type { FaqListScreenProps } from "./FaqListScreen.types";

const PAGE_SIZE = 30;

export function FaqListScreen({ className }: FaqListScreenProps) {
  const t = useTranslations("Admin.Support");
  const navigate = useNavigate();
  const styles = faqListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<AdminFaqItem | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSupport.listFaq({
        page,
        page_size: pageSize,
        publishStatus: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
    },
    [statusFilter, search],
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
  } = useAdminInfiniteQuery<AdminFaqItem>({
    queryKey,
    pageSize: PAGE_SIZE,
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
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <FaqListHeaderSection
          statusFilter={statusFilter}
          onCreate={() => navigate(routes.supportFaqNew)}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <FaqListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onDelete={(row) => {
            setDeleting(row);
            setDeleteError(null);
          }}
          onEdit={(row) => navigate(routes.supportFaqEdit(row.id))}
          onLoadMore={loadMore}
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
