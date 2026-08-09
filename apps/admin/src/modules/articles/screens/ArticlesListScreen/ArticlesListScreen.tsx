import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  AdminArticle,
  ArticleAudience,
  ArticleKind,
  PublishStatus,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminArticles } from "@/shared/lib/api";
import { ArticleCoverField } from "../../components/ArticleCoverField";
import { ArticleRichTextEditor } from "../../components/ArticleRichTextEditor";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  PUBLISH_STATUSES,
} from "../../lib/article-constants";
import { articlesListScreenVariants } from "./ArticlesListScreen.styles";
import type { ArticlesListScreenProps } from "./ArticlesListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminArticle>();

type ArticlesTableMeta = {
  onEdit: (row: AdminArticle) => void;
  onDelete: (row: AdminArticle) => void;
  actionsClassName: string;
};

function parseTags(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function ArticlesListScreen({ className }: ArticlesListScreenProps) {
  const t = useTranslations("Admin.Articles");
  const tBasics = useTranslations("Admin.Basics");
  const styles = articlesListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState<ArticleKind>("guide");
  const [audience, setAudience] = useState<ArticleAudience>("all");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("draft");
  const [tags, setTags] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setSlug("");
    setCategory("");
    setKind("guide");
    setAudience("all");
    setExcerpt("");
    setBody("");
    setCoverMediaId(null);
    setPublishStatus("draft");
    setTags("");
    setSeoTitle("");
    setSeoDescription("");
    setSaveError(null);
  };

  const openCreate = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (row: AdminArticle) => {
    setEditing(row);
    setTitle(row.title);
    setSlug(row.slug);
    setCategory(row.taxonomy.category);
    setKind(row.taxonomy.kind);
    setAudience(row.taxonomy.audience);
    setExcerpt(row.excerpt ?? "");
    setBody(row.body);
    setCoverMediaId(row.coverMediaId);
    setPublishStatus(row.publishStatus);
    setTags(row.tags.join(", "));
    setSeoTitle(row.seo.title ?? "");
    setSeoDescription(row.seo.description ?? "");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("columns.title"),
          size: 220,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.taxonomy.category, {
          id: "category",
          header: t("columns.category"),
          size: 110,
          enableSorting: false,
        }),
        columnHelper.accessor((row) => row.taxonomy.kind, {
          id: "kind",
          header: t("columns.kind"),
          size: 100,
          enableSorting: false,
          cell: (info) => t(`kinds.${info.getValue()}`),
        }),
        columnHelper.accessor((row) => row.taxonomy.audience, {
          id: "audience",
          header: t("columns.audience"),
          size: 100,
          enableSorting: false,
          cell: (info) => t(`audiences.${info.getValue()}`),
        }),
        columnHelper.accessor("readingTimeMinutes", {
          header: t("columns.readingTime"),
          size: 90,
          enableSorting: false,
          cell: (info) => t("readingTimeValue", { minutes: info.getValue() }),
        }),
        columnHelper.accessor("publishStatus", {
          header: t("columns.publishStatus"),
          size: 120,
          enableSorting: false,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "published"
                ? "success"
                : status === "draft"
                  ? "warning"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`publishStatus.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.accessor("engagement", {
          header: t("columns.engagement"),
          size: 140,
          enableSorting: false,
          cell: (info) => {
            const value = info.getValue();
            return (
              <span className="tabular-nums text-muted">
                {t("engagementSummary", {
                  likes: value.likesCount,
                  comments: value.commentsCount,
                  saves: value.savesCount,
                })}
              </span>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as ArticlesTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onDelete(info.row.original)}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminArticle, unknown>[],
    [t],
  );

  const meta: ArticlesTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onDelete: (row) => {
      setDeleting(row);
      setDeleteError(null);
    },
  };

  const canSave =
    title.trim().length >= 3 &&
    category.trim().length >= 2 &&
    body.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const input = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      taxonomy: {
        category: category.trim(),
        kind,
        audience,
      },
      excerpt: excerpt.trim() || undefined,
      body,
      coverMediaId: coverMediaId ?? undefined,
      publishStatus,
      tags: parseTags(tags),
      seo: {
        title: seoTitle.trim() || undefined,
        description: seoDescription.trim() || undefined,
      },
    };
    try {
      if (editing) {
        await adminArticles.update(editing.id, {
          ...input,
          coverMediaId: coverMediaId,
          excerpt: excerpt.trim() || null,
        });
      } else {
        await adminArticles.create(input);
      }
      setDrawerOpen(false);
      void reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setSaving(false);
    }
  };

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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["all", ...PUBLISH_STATUSES] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setStatusFilter(value)}
                selected={statusFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`publishStatus.${value}`)}
              </FilterChip>
            ))}
            <Button size="sm" variant="primary" onPress={openCreate}>
              {t("actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("title")}
          columns={columns}
          data={items}
          emptyLabel={t("empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminFormDrawer
        className="max-w-3xl sm:max-w-3xl"
        isOpen={drawerOpen}
        title={editing ? t("actions.editTitle") : t("actions.createTitle")}
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="title"
            value={title}
            onChange={setTitle}
          >
            <Label>{t("fields.title")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="category"
            value={category}
            onChange={setCategory}
          >
            <Label>{t("fields.category")}</Label>
            <Input placeholder={t("fields.categoryHint")} />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("fields.kind")}</Label>
            <div className={styles.chips()}>
              {ARTICLE_KINDS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={kind === value ? "primary" : "secondary"}
                  onPress={() => setKind(value)}
                >
                  {t(`kinds.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("fields.audience")}</Label>
            <div className={styles.chips()}>
              {ARTICLE_AUDIENCES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={audience === value ? "primary" : "secondary"}
                  onPress={() => setAudience(value)}
                >
                  {t(`audiences.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            className={styles.field()}
            fullWidth
            name="slug"
            value={slug}
            onChange={setSlug}
          >
            <Label>{t("fields.slug")}</Label>
            <Input placeholder={t("fields.slugHint")} />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="excerpt"
            value={excerpt}
            onChange={setExcerpt}
          >
            <Label>{t("fields.excerpt")}</Label>
            <TextArea className="min-h-20" />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("fields.body")}</Label>
            <ArticleRichTextEditor
              disabled={saving}
              value={body}
              onChange={setBody}
            />
          </div>

          <ArticleCoverField
            key={editing?.id ?? "create"}
            disabled={saving}
            errorMessage={tBasics("media.error")}
            hint={t("fields.coverHint")}
            label={t("fields.cover")}
            removeLabel={tBasics("media.remove")}
            retryLabel={tBasics("media.retry")}
            successMessage={tBasics("media.success")}
            uploaderButtonLabel={tBasics("media.uploaderButton")}
            uploaderDescription={tBasics("media.uploaderDescription")}
            uploaderTitle={tBasics("media.uploaderTitle")}
            value={coverMediaId}
            onChange={setCoverMediaId}
          />

          <div className={styles.field()}>
            <Label>{t("fields.publishStatus")}</Label>
            <div className={styles.chips()}>
              {PUBLISH_STATUSES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={publishStatus === value ? "primary" : "secondary"}
                  onPress={() => setPublishStatus(value)}
                >
                  {t(`publishStatus.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            className={styles.field()}
            fullWidth
            name="tags"
            value={tags}
            onChange={setTags}
          >
            <Label>{t("fields.tags")}</Label>
            <Input placeholder={t("fields.tagsHint")} />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="seoTitle"
            value={seoTitle}
            onChange={setSeoTitle}
          >
            <Label>{t("fields.seoTitle")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="seoDescription"
            value={seoDescription}
            onChange={setSeoDescription}
          >
            <Label>{t("fields.seoDescription")}</Label>
            <TextArea className="min-h-20" />
          </TextField>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !canSave}
              variant="primary"
              onPress={() => void handleSave()}
            >
              {t("actions.save")}
            </Button>
            <Button
              isDisabled={saving}
              variant="secondary"
              onPress={() => setDrawerOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("actions.deleteBody")}</p>
            {deleteError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {deleteError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.delete")}
        confirmVariant="danger"
        isOpen={Boolean(deleting)}
        isPending={deletePending}
        title={t("actions.deleteTitle")}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}
