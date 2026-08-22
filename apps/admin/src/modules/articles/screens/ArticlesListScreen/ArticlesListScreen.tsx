import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  AdminArticle,
  ArticleAudience,
  ArticleKind,
  PublishStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminArticles } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { ArticlesListDeleteDialogSection } from "../../sections/ArticlesListDeleteDialogSection";
import { ArticlesListHeaderSection } from "../../sections/ArticlesListHeaderSection";
import { ArticlesListTableSection } from "../../sections/ArticlesListTableSection";
import { articlesListScreenVariants } from "./ArticlesListScreen.styles";
import type { ArticlesListScreenProps } from "./ArticlesListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["publishStatus", "kind", "audience"] as const;

type ArticlesListFilters = {
  publishStatus: PublishStatus | "all";
  kind: ArticleKind | "all";
  audience: ArticleAudience | "any";
};

const FILTER_DEFAULTS: ArticlesListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  publishStatus: "all",
  kind: "all",
  audience: "any",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function ArticlesListScreen({ className }: ArticlesListScreenProps) {
  const t = useTranslations("Admin.Articles");
  const navigate = useNavigate();
  const styles = articlesListScreenVariants();

  const {
    search,
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    page,
    pageSize,
    setPage,
  } = useAdminListQueryParams<ArticlesListFilters>({
    filterKeys: FILTER_KEYS,
    defaults: FILTER_DEFAULTS,
  });
  const [deleting, setDeleting] = useState<AdminArticle | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, search, pageSize }),
    [filters, pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminArticles.list({
        page: nextPage,
        page_size: nextPageSize,
        publishStatus:
          filters.publishStatus === "all" ? undefined : filters.publishStatus,
        kind: filters.kind === "all" ? undefined : filters.kind,
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
  } = useAdminPaginatedQuery<AdminArticle>({
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
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
      className={className}
    >
      <div className={styles.content()}>
        <ArticlesListHeaderSection
          audienceFilter={filters.audience}
          kindFilter={filters.kind}
          statusFilter={filters.publishStatus}
          onAudienceChange={(value) => setFilter("audience", value)}
          onCreate={() => navigate(routes.articlesNew)}
          onKindChange={(value) => setFilter("kind", value)}
          onRefresh={() => void reload()}
          onStatusChange={(value) => setFilter("publishStatus", value)}
        />

        <ArticlesListTableSection
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
          onEdit={(row) => navigate(routes.articleEdit(row.id))}
          onPageChange={changePage}
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
