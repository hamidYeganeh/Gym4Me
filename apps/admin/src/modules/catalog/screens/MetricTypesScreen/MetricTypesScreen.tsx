import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { MetricType, MetricValueKind } from "@repo/api";
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
import { metricTypesScreenVariants } from "./MetricTypesScreen.styles";
import type { MetricTypesScreenProps } from "./MetricTypesScreen.types";

const PAGE_SIZE = 30;
const VALUE_KINDS: MetricValueKind[] = [
  "number",
  "pair",
  "range",
  "ratio",
  "text",
];

const columnHelper = createColumnHelper<MetricType>();

type MetricTableMeta = {
  actionsClassName: string;
  onEdit: (row: MetricType) => void;
  onArchive: (row: MetricType) => void;
};

export function MetricTypesScreen({ className }: MetricTypesScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = metricTypesScreenVariants();

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MetricType | null>(null);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [valueKind, setValueKind] = useState<MetricValueKind>("number");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<MetricType | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize: PAGE_SIZE }),
    [search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminProgress.listMetricTypes({
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
  } = useAdminInfiniteQuery<MetricType>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("metrics.errorLoad"),
    fetchPage,
  });

  const openCreate = () => {
    setEditing(null);
    setKey("");
    setName("");
    setUnit("");
    setValueKind("number");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: MetricType) => {
    setEditing(row);
    setKey(row.key);
    setName(row.name);
    setUnit(row.unit ?? "");
    setValueKind(row.valueKind);
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("key", {
          header: t("metrics.columns.key"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("name", {
          header: t("metrics.columns.name"),
        }),
        columnHelper.accessor("valueKind", {
          header: t("metrics.columns.valueKind"),
        }),
        columnHelper.accessor((row) => row.unit ?? "—", {
          id: "unit",
          header: t("metrics.columns.unit"),
        }),
        columnHelper.accessor("status", {
          header: t("metrics.columns.status"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "active" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("metrics.columns.actions"),
          size: 170,
          cell: (info) => {
            const meta = info.table.options.meta as MetricTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("edit")}
                </Button>
                {info.row.original.status === "active" ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onPress={() => meta.onArchive(info.row.original)}
                  >
                    {t("archive")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<MetricType, unknown>[],
    [t],
  );

  const meta: MetricTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const handleSave = async () => {
    if (!name.trim() || (!editing && !key.trim())) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) {
        await adminProgress.updateMetricType(editing.id, {
          name: name.trim(),
          unit: unit.trim() || undefined,
          valueKind,
        });
      } else {
        await adminProgress.createMetricType({
          key: key.trim(),
          name: name.trim(),
          unit: unit.trim() || undefined,
          valueKind,
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

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminProgress.archiveMetricType(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{
        activeTabId: "metrics",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("metrics.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("metrics.subtitle")}
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
          ariaLabel={t("metrics.title")}
          columns={columns}
          data={items}
          emptyLabel={t("metrics.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("metrics.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={drawerOpen}
        title={editing ? t("metrics.editTitle") : t("metrics.createTitle")}
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          {!editing ? (
            <TextField
              className={styles.field()}
              fullWidth
              name="key"
              value={key}
              onChange={setKey}
            >
              <Label>{t("metrics.fields.key")}</Label>
              <Input dir="ltr" />
            </TextField>
          ) : null}

          <TextField
            className={styles.field()}
            fullWidth
            name="name"
            value={name}
            onChange={setName}
          >
            <Label>{t("metrics.fields.name")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="unit"
            value={unit}
            onChange={setUnit}
          >
            <Label>{t("metrics.fields.unit")}</Label>
            <Input dir="ltr" />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("metrics.fields.valueKind")}</Label>
            <div className={styles.chips()}>
              {VALUE_KINDS.map((kind) => (
                <Button
                  key={kind}
                  size="sm"
                  variant={valueKind === kind ? "primary" : "secondary"}
                  onPress={() => setValueKind(kind)}
                >
                  {kind}
                </Button>
              ))}
            </div>
          </div>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !name.trim() || (!editing && !key.trim())}
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

      <AdminConfirmDialog
        body={
          <>
            <p>{t("metrics.archiveBody")}</p>
            {archiveError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {archiveError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={archivePending}
        title={t("metrics.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
