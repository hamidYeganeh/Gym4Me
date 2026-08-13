import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { FoodItem, FoodItemStatus } from "@repo/api";
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
import { adminNutrition } from "@/shared/lib/api";
import { foodItemsScreenVariants } from "./FoodItemsScreen.styles";
import type { FoodItemsScreenProps } from "./FoodItemsScreen.types";

const PAGE_SIZE = 30;
const STATUSES: Array<FoodItemStatus | "all"> = ["all", "active", "archived"];

const columnHelper = createColumnHelper<FoodItem>();

type FoodTableMeta = {
  actionsClassName: string;
  onEdit: (row: FoodItem) => void;
  onArchive: (row: FoodItem) => void;
};

export function FoodItemsScreen({ className }: FoodItemsScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = foodItemsScreenVariants();

  const [statusFilter, setStatusFilter] = useState<FoodItemStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [name, setName] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [servingLabel, setServingLabel] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<FoodItem | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, search, pageSize: PAGE_SIZE }),
    [statusFilter, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminNutrition.listFoodItems({
        page,
        page_size: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
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
  } = useAdminInfiniteQuery<FoodItem>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("food.errorLoad"),
    fetchPage,
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setCategoryKey("");
    setServingLabel("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: FoodItem) => {
    setEditing(row);
    setName(row.name);
    setCategoryKey(row.categoryKey ?? "");
    setServingLabel(row.servingLabel ?? "");
    setCalories(row.macros.calories != null ? String(row.macros.calories) : "");
    setProtein(row.macros.proteinG != null ? String(row.macros.proteinG) : "");
    setCarbs(row.macros.carbsG != null ? String(row.macros.carbsG) : "");
    setFat(row.macros.fatG != null ? String(row.macros.fatG) : "");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("name", {
          header: t("food.columns.name"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate font-medium">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.categoryKey ?? "—", {
          id: "category",
          header: t("food.columns.category"),
        }),
        columnHelper.accessor((row) => row.servingLabel ?? "—", {
          id: "serving",
          header: t("food.columns.serving"),
        }),
        columnHelper.accessor((row) => row.macros.calories ?? "—", {
          id: "calories",
          header: t("food.columns.calories"),
        }),
        columnHelper.accessor((row) => row.macros.proteinG ?? "—", {
          id: "protein",
          header: t("food.columns.protein"),
        }),
        columnHelper.accessor("status", {
          header: t("food.columns.status"),
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
          header: t("food.columns.actions"),
          size: 170,
          cell: (info) => {
            const meta = info.table.options.meta as FoodTableMeta | undefined;
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
      ] as ColumnDef<FoodItem, unknown>[],
    [t],
  );

  const meta: FoodTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const parseMacro = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaveError(null);
    const input = {
      name: name.trim(),
      categoryKey: categoryKey.trim() || undefined,
      servingLabel: servingLabel.trim() || undefined,
      macros: {
        calories: parseMacro(calories),
        proteinG: parseMacro(protein),
        carbsG: parseMacro(carbs),
        fatG: parseMacro(fat),
      },
    };
    try {
      if (editing) {
        await adminNutrition.updateFoodItem(editing.id, input);
      } else {
        await adminNutrition.createFoodItem(input);
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
      await adminNutrition.archiveFoodItem(archiving.id);
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
        activeTabId: "food",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("food.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("food.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {STATUSES.map((status) => (
              <FilterChip
                key={status}
                onPress={() => setStatusFilter(status)}
                selected={statusFilter === status}
              >
                {status === "all" ? t("filterAll") : status}
              </FilterChip>
            ))}
            <Button size="sm" variant="primary" onPress={openCreate}>
              {t("create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("food.title")}
          columns={columns}
          data={items}
          emptyLabel={t("food.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("food.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={drawerOpen}
        title={editing ? t("food.editTitle") : t("food.createTitle")}
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
            <Label>{t("food.fields.name")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="categoryKey"
            value={categoryKey}
            onChange={setCategoryKey}
          >
            <Label>{t("food.fields.categoryKey")}</Label>
            <Input dir="ltr" />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="servingLabel"
            value={servingLabel}
            onChange={setServingLabel}
          >
            <Label>{t("food.fields.servingLabel")}</Label>
            <Input />
          </TextField>

          <div className={styles.macroGrid()}>
            <TextField
              className={styles.field()}
              fullWidth
              name="calories"
              value={calories}
              onChange={setCalories}
            >
              <Label>{t("food.fields.calories")}</Label>
              <Input dir="ltr" inputMode="decimal" />
            </TextField>
            <TextField
              className={styles.field()}
              fullWidth
              name="protein"
              value={protein}
              onChange={setProtein}
            >
              <Label>{t("food.fields.protein")}</Label>
              <Input dir="ltr" inputMode="decimal" />
            </TextField>
            <TextField
              className={styles.field()}
              fullWidth
              name="carbs"
              value={carbs}
              onChange={setCarbs}
            >
              <Label>{t("food.fields.carbs")}</Label>
              <Input dir="ltr" inputMode="decimal" />
            </TextField>
            <TextField
              className={styles.field()}
              fullWidth
              name="fat"
              value={fat}
              onChange={setFat}
            >
              <Label>{t("food.fields.fat")}</Label>
              <Input dir="ltr" inputMode="decimal" />
            </TextField>
          </div>

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

      <AdminConfirmDialog
        body={
          <>
            <p>{t("food.archiveBody")}</p>
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
        title={t("food.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
