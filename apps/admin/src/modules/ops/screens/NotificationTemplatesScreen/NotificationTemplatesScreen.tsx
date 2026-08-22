import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { NotificationTemplate } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable, AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminNotificationTemplates } from "@/shared/lib/api";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { routes } from "@/shared/lib/routes";
import { notificationTemplatesScreenVariants } from "./NotificationTemplatesScreen.styles";
import type { NotificationTemplatesScreenProps } from "./NotificationTemplatesScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = [] as const;
const columnHelper = createColumnHelper<NotificationTemplate>();

type TemplatesFilters = {
  __unused?: string;
};

const FILTER_DEFAULTS = {
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

type TemplateTableMeta = {
  actionsClassName: string;
  onEdit: (row: NotificationTemplate) => void;
};

export function NotificationTemplatesScreen({
  className,
}: NotificationTemplatesScreenProps) {
  const t = useTranslations("Admin.Ops");
  const tCommon = useTranslations("Admin.Common");
  const navigate = useNavigate();
  const styles = notificationTemplatesScreenVariants();

  const { search, searchInput, setSearchInput, page, pageSize, setPage } =
    useAdminListQueryParams<TemplatesFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize }),
    [pageSize, search],
  );

  const fetchPage = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      return adminNotificationTemplates.list({
        page: nextPage,
        page_size: nextPageSize,
        search: search.trim() || undefined,
      });
    },
    [search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<NotificationTemplate>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("templates.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("key", {
          header: t("templates.columns.key"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("title", {
          header: t("templates.columns.title"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate">{getValue()}</span>
          ),
        }),
        columnHelper.accessor((row) => row.channels.push, {
          id: "push",
          header: t("templates.columns.push"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "enabled" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor((row) => row.channels.sms, {
          id: "sms",
          header: t("templates.columns.sms"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "disabled" ? "warning" : "success"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor((row) => row.channels.inbox, {
          id: "inbox",
          header: t("templates.columns.inbox"),
          cell: ({ getValue }) => (
            <Chip
              color={getValue() === "enabled" ? "success" : "warning"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("templates.columns.status"),
        }),
        columnHelper.display({
          id: "actions",
          header: t("templates.columns.actions"),
          size: 110,
          cell: (info) => {
            const meta = info.table.options.meta as
              | TemplateTableMeta
              | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("templates.editTitle")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<NotificationTemplate, unknown>[],
    [t],
  );

  const meta: TemplateTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.opsTemplateEdit(row.key)),
  };

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{
        activeTabId: "templates",
        searchValue: searchInput,
        onSearchChange: setSearchInput,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("templates.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("templates.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("templates.title")}
          columns={columns}
          data={items}
          emptyLabel={t("templates.empty")}
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
            onPageChange: changePage,
          })}
          summaryLabel={tCommon("pagination.summary", summary)}
        />
      </div>
    </AdminShell>
  );
}
