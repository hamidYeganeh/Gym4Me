import { useMemo } from "react";
import { Button, Chip } from "@heroui/react";
import type { Exercise } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { exercisesCatalogTableSectionVariants } from "./ExercisesCatalogTableSection.styles";
import type {
  ExerciseTableMeta,
  ExercisesCatalogTableSectionProps,
} from "./ExercisesCatalogTableSection.types";

const columnHelper = createColumnHelper<Exercise>();

export function ExercisesCatalogTableSection({
  items,
  total,
  loading,
  fetchingMore,
  hasMore,
  error,
  onLoadMore,
  onEdit,
  onApprove,
  onReject,
  onArchive,
  className,
}: ExercisesCatalogTableSectionProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = exercisesCatalogTableSectionVariants();

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
            const meta = info.table.options.meta as ExerciseTableMeta | undefined;
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

  const meta: ExerciseTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
    onApprove,
    onReject,
    onArchive,
  };

  return (
    <AdminDataTable
      ariaLabel={t("exercises.title")}
      className={className}
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
      summaryLabel={t("exercises.summary", { loaded: items.length, total })}
      onLoadMore={onLoadMore}
    />
  );
}
