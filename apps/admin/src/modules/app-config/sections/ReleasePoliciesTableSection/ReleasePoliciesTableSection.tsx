import { useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { MobileReleasePolicy } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import { releasePoliciesTableSectionVariants } from "./ReleasePoliciesTableSection.styles";
import type { ReleasePoliciesTableSectionProps } from "./ReleasePoliciesTableSection.types";

const columnHelper = createColumnHelper<MobileReleasePolicy>();

type PolicyTableMeta = {
  actionsClassName: string;
  onEdit: (row: MobileReleasePolicy) => void;
};

export function ReleasePoliciesTableSection({
  items,
  loading,
  error,
  onEdit,
}: ReleasePoliciesTableSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = releasePoliciesTableSectionVariants();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("platform", {
          header: t("releases.columns.platform"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("channel", {
          header: t("releases.columns.channel"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("minimumSupportedAppVersion", {
          header: t("releases.columns.minimum"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("latestAppVersion", {
          header: t("releases.columns.latest"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("releaseNotes", {
          header: t("releases.columns.whatsNew"),
          cell: ({ getValue }) => {
            const notes = getValue();
            if (!notes) return t("releases.notesEmpty");
            return t("releases.notesSummary", {
              title: notes.title,
              count: notes.features.length,
            });
          },
        }),
        columnHelper.accessor("recommendedApiVersion", {
          header: t("releases.columns.api"),
          cell: ({ getValue }) => <span dir="ltr">{getValue()}</span>,
        }),
        columnHelper.accessor("enabled", {
          header: t("releases.columns.enabled"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue() ? "on" : "off"}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: t("releases.columns.actions"),
          size: 120,
          cell: (info) => {
            const meta = info.table.options.meta as PolicyTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("releases.editTitle")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<MobileReleasePolicy, unknown>[],
    [t],
  );

  const meta: PolicyTableMeta = {
    actionsClassName: styles.actions(),
    onEdit,
  };

  return (
    <AdminDataTable
      ariaLabel={t("releases.title")}
      columns={columns}
      data={items}
      emptyLabel={t("releases.empty")}
      error={error}
      getRowId={(row) => row.id}
      hasMore={false}
      isFetchingMore={false}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={meta}
      onLoadMore={() => {}}
      summaryLabel={t("releases.summary", { loaded: items.length })}
    />
  );
}
