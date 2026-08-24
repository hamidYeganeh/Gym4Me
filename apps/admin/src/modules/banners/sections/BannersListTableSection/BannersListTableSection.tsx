import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { AdminBanner } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { mediaApi } from "@/shared/lib/api";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { bannersListTableSectionVariants } from "./BannersListTableSection.styles";
import type {
  BannerTableMeta,
  BannersListTableSectionProps,
} from "./BannersListTableSection.types";

const columnHelper = createColumnHelper<AdminBanner>();

export function BannersListTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  onEdit,
  onDelete,
  className,
}: BannersListTableSectionProps) {
  const t = useTranslations("Admin.Banners");
  const tCommon = useTranslations("Admin.Common");
  const styles = bannersListTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.display({
          id: "preview",
          header: t("columns.preview"),
          size: 132,
          cell: (info) => {
            const slides = info.row.original.slides;
            return (
              <div className={styles.previewGroup()}>
                {slides.slice(0, 3).map((slide, index) => (
                  <img
                    alt={slide.alt ?? info.row.original.title ?? ""}
                    className={styles.previewImage()}
                    key={`${slide.mediaId}-${index}`}
                    loading="lazy"
                    src={mediaApi.fileUrl(slide.mediaId)}
                  />
                ))}
                {slides.length > 3 ? (
                  <span className={styles.previewMore()}>
                    +{slides.length - 3}
                  </span>
                ) : null}
              </div>
            );
          },
        }),
        columnHelper.accessor("title", {
          header: t("columns.title"),
          size: 220,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue() || "بدون عنوان"}
            </span>
          ),
        }),
        columnHelper.accessor("placement", {
          header: t("columns.placement"),
          size: 150,
          enableSorting: false,
          cell: (info) => t(`placements.${info.getValue()}`),
        }),
        columnHelper.accessor((row) => row.slides.length, {
          id: "slides",
          header: t("columns.slides"),
          size: 80,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
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
        columnHelper.accessor("order", {
          header: t("columns.order"),
          size: 70,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as BannerTableMeta | undefined;
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
      ] as ColumnDef<AdminBanner, unknown>[],
    [t],
  );

  const meta: BannerTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
    onDelete,
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminDataTable
      ariaLabel={t("title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("empty")}
      error={error}
      getRowId={(row) => row.id}
      isLoading={loading}
      loadingLabel={t("loading")}
      meta={meta}
      pagination={adminListPaginationProps({
        page,
        totalPages,
        previousLabel: tCommon("pagination.previous"),
        nextLabel: tCommon("pagination.next"),
        onPageChange,
      })}
      summaryLabel={tCommon("pagination.summary", summary)}
    />
  );
}
