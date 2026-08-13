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
import type { PlatformPlan } from "@repo/api";
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
import { adminMemberships } from "@/shared/lib/api";
import { platformPlansScreenVariants } from "./PlatformPlansScreen.styles";
import type { PlatformPlansScreenProps } from "./PlatformPlansScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<PlatformPlan>();

type PlanTableMeta = {
  actionsClassName: string;
  onEdit: (row: PlatformPlan) => void;
  onArchive: (row: PlatformPlan) => void;
};

export function PlatformPlansScreen({ className }: PlatformPlansScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = platformPlansScreenVariants();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformPlan | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [periodDays, setPeriodDays] = useState("30");
  const [features, setFeatures] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<PlatformPlan | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, pageSize: number) => {
    return adminMemberships.listPlatformPlans({
      page,
      page_size: pageSize,
    });
  }, []);

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<PlatformPlan>({
    queryKey: "platform-plans",
    pageSize: PAGE_SIZE,
    errorFallback: t("plans.errorLoad"),
    fetchPage,
  });

  const openCreate = () => {
    setEditing(null);
    setCode("");
    setName("");
    setDescription("");
    setAmount("0");
    setPeriodDays("30");
    setFeatures("");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: PlatformPlan) => {
    setEditing(row);
    setCode(row.code);
    setName(row.name);
    setDescription(row.description ?? "");
    setAmount(String(row.pricing.amount));
    setPeriodDays(String(row.pricing.periodDays ?? 30));
    setFeatures((row.features ?? []).join("; "));
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("code", {
          header: t("plans.columns.code"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("name", {
          header: t("plans.columns.name"),
        }),
        columnHelper.accessor((row) => row.pricing.amount, {
          id: "amount",
          header: t("plans.columns.amount"),
          cell: ({ getValue }) => (
            <span className="tabular-nums">
              {Number(getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.pricing.periodDays ?? "—", {
          id: "periodDays",
          header: t("plans.columns.periodDays"),
        }),
        columnHelper.accessor("status", {
          header: t("plans.columns.status"),
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
          header: t("plans.columns.actions"),
          size: 170,
          cell: (info) => {
            const meta = info.table.options.meta as PlanTableMeta | undefined;
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
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onArchive(info.row.original)}
                >
                  {t("archive")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<PlatformPlan, unknown>[],
    [t],
  );

  const meta: PlanTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const handleSave = async () => {
    if (!name.trim() || (!editing && !code.trim())) return;
    setSaving(true);
    setSaveError(null);
    const featureList = features
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
    try {
      if (editing) {
        await adminMemberships.updatePlatformPlan(editing.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          pricing: {
            amount: Number.parseInt(amount, 10) || 0,
            periodDays: Number.parseInt(periodDays, 10) || 30,
          },
          features: featureList,
        });
      } else {
        await adminMemberships.createPlatformPlan({
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          pricing: {
            amount: Number.parseInt(amount, 10) || 0,
            periodDays: Number.parseInt(periodDays, 10) || 30,
          },
          features: featureList,
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
      await adminMemberships.archivePlatformPlan(archiving.id);
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
      catalogSection={{ activeTabId: "plans" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("plans.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("plans.subtitle")}
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
          ariaLabel={t("plans.title")}
          columns={columns}
          data={items}
          emptyLabel={t("plans.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("plans.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={drawerOpen}
        title={editing ? t("plans.editTitle") : t("plans.createTitle")}
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          {!editing ? (
            <TextField
              className={styles.field()}
              fullWidth
              name="code"
              value={code}
              onChange={setCode}
            >
              <Label>{t("plans.fields.code")}</Label>
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
            <Label>{t("plans.fields.name")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="description"
            value={description}
            onChange={setDescription}
          >
            <Label>{t("plans.fields.description")}</Label>
            <TextArea className="min-h-20" />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="amount"
            value={amount}
            onChange={setAmount}
          >
            <Label>{t("plans.fields.amount")}</Label>
            <Input dir="ltr" inputMode="numeric" />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="periodDays"
            value={periodDays}
            onChange={setPeriodDays}
          >
            <Label>{t("plans.fields.periodDays")}</Label>
            <Input dir="ltr" inputMode="numeric" />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="features"
            value={features}
            onChange={setFeatures}
          >
            <Label>{t("plans.fields.features")}</Label>
            <TextArea className="min-h-20" />
          </TextField>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !name.trim() || (!editing && !code.trim())}
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
            <p>{t("plans.archiveBody")}</p>
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
        title={t("plans.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
