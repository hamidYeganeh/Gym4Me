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
import type { AdminFaqItem, FaqAudience, PublishStatus } from "@repo/api";
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
import { adminSupport } from "@/shared/lib/api";
import { FAQ_AUDIENCES, PUBLISH_STATUSES } from "../../lib/support-constants";
import { faqListScreenVariants } from "./FaqListScreen.styles";
import type { FaqListScreenProps } from "./FaqListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminFaqItem>();

type FaqTableMeta = {
  onEdit: (row: AdminFaqItem) => void;
  onDelete: (row: AdminFaqItem) => void;
  actionsClassName: string;
};

export function FaqListScreen({ className }: FaqListScreenProps) {
  const t = useTranslations("Admin.Support");
  const styles = faqListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFaqItem | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [audience, setAudience] = useState<FaqAudience>("all");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("draft");
  const [order, setOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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

  const openCreate = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setAudience("all");
    setPublishStatus("draft");
    setOrder("0");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: AdminFaqItem) => {
    setEditing(row);
    setQuestion(row.question);
    setAnswer(row.answer);
    setAudience(row.audience);
    setPublishStatus(row.publishStatus);
    setOrder(String(row.order));
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("question", {
          header: t("faqColumns.question"),
          size: 260,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("audience", {
          header: t("faqColumns.audience"),
          size: 120,
          enableSorting: false,
          cell: (info) => t(`audience.${info.getValue()}`),
        }),
        columnHelper.accessor("publishStatus", {
          header: t("faqColumns.publishStatus"),
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
        columnHelper.accessor("order", {
          header: t("faqColumns.order"),
          size: 70,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("faqColumns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as FaqTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("faqActions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onDelete(info.row.original)}
                >
                  {t("faqActions.delete")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminFaqItem, unknown>[],
    [t],
  );

  const meta: FaqTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onDelete: (row) => {
      setDeleting(row);
      setDeleteError(null);
    },
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    setSaveError(null);
    const input = {
      question: question.trim(),
      answer: answer.trim(),
      audience,
      publishStatus,
      order: Number.parseInt(order, 10) || 0,
    };
    try {
      if (editing) {
        await adminSupport.updateFaq(editing.id, input);
      } else {
        await adminSupport.createFaq(input);
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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("faqTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("faqSubtitle")}
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
              {t("faqActions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("faqTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("faqEmpty")}
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
        isOpen={drawerOpen}
        title={editing ? t("faqActions.editTitle") : t("faqActions.createTitle")}
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="question"
            value={question}
            onChange={setQuestion}
          >
            <Label>{t("faqColumns.question")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="answer"
            value={answer}
            onChange={setAnswer}
          >
            <Label>{t("faqFields.answer")}</Label>
            <TextArea className="min-h-32" />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("faqColumns.audience")}</Label>
            <div className={styles.chips()}>
              {FAQ_AUDIENCES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={audience === value ? "primary" : "secondary"}
                  onPress={() => setAudience(value)}
                >
                  {t(`audience.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("faqColumns.publishStatus")}</Label>
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
            name="order"
            value={order}
            onChange={setOrder}
          >
            <Label>{t("faqColumns.order")}</Label>
            <Input inputMode="numeric" />
          </TextField>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !question.trim() || !answer.trim()}
              variant="primary"
              onPress={() => void handleSave()}
            >
              {t("faqActions.save")}
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
            <p>{t("faqActions.deleteBody")}</p>
            {deleteError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {deleteError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("faqActions.delete")}
        confirmVariant="danger"
        isOpen={Boolean(deleting)}
        isPending={deletePending}
        title={t("faqActions.deleteTitle")}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </AdminShell>
  );
}
