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
import type { Exercise } from "@repo/api";
import { ApiError } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminProgress } from "@/shared/lib/api";
import { exercisesCatalogScreenVariants } from "./ExercisesCatalogScreen.styles";
import type { ExercisesCatalogScreenProps } from "./ExercisesCatalogScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<Exercise>();

type ExerciseTableMeta = {
  actionsClassName: string;
  onEdit: (row: Exercise) => void;
  onApprove: (row: Exercise) => void;
  onReject: (row: Exercise) => void;
  onArchive: (row: Exercise) => void;
};

export function ExercisesCatalogScreen({
  className,
}: ExercisesCatalogScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = exercisesCatalogScreenVariants();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [rejecting, setRejecting] = useState<Exercise | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [archiving, setArchiving] = useState<Exercise | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize: PAGE_SIZE }),
    [search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminProgress.listExercises({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
      });
    },
    [search],
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
  } = useAdminInfiniteQuery<Exercise>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("exercises.errorLoad"),
    fetchPage,
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: Exercise) => {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("name", {
          header: t("exercises.columns.name"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate font-medium">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.muscleKeys.join("، ") || "—", {
          id: "muscles",
          header: t("exercises.columns.muscles"),
          cell: ({ getValue }) => (
            <span className="block max-w-48 truncate">{getValue()}</span>
          ),
        }),
        columnHelper.accessor(
          (row) => `${row.status} / ${row.verification.status}`,
          {
            id: "status",
            header: t("exercises.columns.status"),
            cell: ({ row }) => {
              const item = row.original;
              const verification = item.verification.status;
              const color =
                verification === "approved"
                  ? "success"
                  : verification === "rejected"
                    ? "danger"
                    : "warning";
              return (
                <div className="flex items-center gap-1.5">
                  <Chip color={color} size="sm" variant="soft">
                    <Chip.Label>{verification}</Chip.Label>
                  </Chip>
                  <Chip size="sm" variant="soft">
                    <Chip.Label>{item.status}</Chip.Label>
                  </Chip>
                </div>
              );
            },
          },
        ),
        columnHelper.display({
          id: "actions",
          header: t("exercises.columns.actions"),
          size: 260,
          cell: (info) => {
            const meta = info.table.options.meta as
              | ExerciseTableMeta
              | undefined;
            if (!meta) return null;
            const row = info.row.original;
            const isPending = row.verification.status === "pending";
            return (
              <div className={meta.actionsClassName}>
                {isPending ? (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => meta.onApprove(row)}
                    >
                      {t("exercises.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onPress={() => meta.onReject(row)}
                    >
                      {t("exercises.reject")}
                    </Button>
                  </>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(row)}
                >
                  {t("edit")}
                </Button>
                {row.status === "active" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => meta.onArchive(row)}
                  >
                    {t("archive")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<Exercise, unknown>[],
    [t],
  );

  const runAction = async (action: () => Promise<unknown>) => {
    setActionPending(true);
    setActionError(null);
    try {
      await action();
      setRejecting(null);
      setArchiving(null);
      void reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setActionPending(false);
    }
  };

  const meta: ExerciseTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onApprove: (row) => {
      void runAction(() =>
        adminProgress.verifyExercise(row.id, { status: "approved" }),
      );
    },
    onReject: (row) => {
      setRejecting(row);
      setRejectionReason("");
      setActionError(null);
    },
    onArchive: (row) => {
      setArchiving(row);
      setActionError(null);
    },
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) {
        await adminProgress.updateExercise(editing.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await adminProgress.createExercise({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      setDrawerOpen(false);
      void reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{
        activeTabId: "exercises",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("exercises.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("exercises.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button size="sm" variant="primary" onPress={openCreate}>
              {t("create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("exercises.title")}
          columns={columns}
          data={items}
          emptyLabel={t("exercises.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("exercises.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={drawerOpen}
        title={editing ? t("exercises.editTitle") : t("exercises.createTitle")}
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="name"
            value={name}
            onChange={setName}
          >
            <Label>{t("exercises.fields.name")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="description"
            value={description}
            onChange={setDescription}
          >
            <Label>{t("exercises.fields.description")}</Label>
            <TextArea className="min-h-24" />
          </TextField>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !name.trim()}
              variant="primary"
              onPress={() => void handleSave()}
            >
              {t("save")}
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

      <AdminFormDrawer
        isOpen={Boolean(rejecting)}
        title={t("exercises.rejectTitle")}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="rejectionReason"
            value={rejectionReason}
            onChange={setRejectionReason}
          >
            <Label>{t("exercises.fields.rejectionReason")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={actionPending || !rejectionReason.trim()}
              variant="danger"
              onPress={() => {
                if (!rejecting) return;
                void runAction(() =>
                  adminProgress.verifyExercise(rejecting.id, {
                    status: "rejected",
                    rejectionReason: rejectionReason.trim(),
                  }),
                );
              }}
            >
              {t("exercises.reject")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => setRejecting(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("exercises.archiveBody")}</p>
            {actionError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={actionPending}
        title={t("exercises.archiveTitle")}
        onConfirm={() => {
          if (!archiving) return;
          void runAction(() => adminProgress.archiveExercise(archiving.id));
        }}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
