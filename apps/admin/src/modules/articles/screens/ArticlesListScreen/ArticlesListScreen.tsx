import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AdminArticle, PublishStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminArticles } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { ArticlesListDeleteDialogSection } from "../../sections/ArticlesListDeleteDialogSection";
import { ArticlesListHeaderSection } from "../../sections/ArticlesListHeaderSection";
import { ArticlesListTableSection } from "../../sections/ArticlesListTableSection";
import { articlesListScreenVariants } from "./ArticlesListScreen.styles";
import type { ArticlesListScreenProps } from "./ArticlesListScreen.types";

const PAGE_SIZE = 30;

export function ArticlesListScreen({ className }: ArticlesListScreenProps) {
  const t = useTranslations("Admin.Articles");
  const navigate = useNavigate();
  const styles = articlesListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<AdminArticle | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminArticles.list({
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
  } = useAdminInfiniteQuery<AdminArticle>({
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
      await adminArticles.delete(deleting.id);
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
      activeNavId="articles"
      articlesSection={{
        searchValue: search,
        onSearchChange: setSearch,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <ArticlesListHeaderSection
          statusFilter={statusFilter}
          onCreate={() => navigate(routes.articlesNew)}
          onRefresh={() => void reload()}
          onStatusChange={setStatusFilter}
        />

        <ArticlesListTableSection
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
          onEdit={(row) => navigate(routes.articleEdit(row.id))}
          onLoadMore={loadMore}
        />
      </div>

      <ArticlesListDeleteDialogSection
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
