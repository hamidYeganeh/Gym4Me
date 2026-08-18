import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { NotificationTemplate } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable, AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminNotificationTemplates } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { notificationTemplatesScreenVariants } from "./NotificationTemplatesScreen.styles";
import type { NotificationTemplatesScreenProps } from "./NotificationTemplatesScreen.types";

const columnHelper = createColumnHelper<NotificationTemplate>();

type TemplateTableMeta = {
  actionsClassName: string;
  onEdit: (row: NotificationTemplate) => void;
};

export function NotificationTemplatesScreen({
  className,
}: NotificationTemplatesScreenProps) {
  const t = useTranslations("Admin.Ops");
  const navigate = useNavigate();
  const styles = notificationTemplatesScreenVariants();

  const [search, setSearch] = useState("");

  const queryKey = useMemo(() => JSON.stringify({ search }), [search]);

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      const response = await adminNotificationTemplates.list({
        search: search.trim() || undefined,
      });
      return {
        result: response.items,
        pagination: {
          page,
          page_size: pageSize,
          next: null,
          prev: null,
          total: response.items.length,
        },
      };
    },
    [search],
  );

  const { items, loading, error, reload } =
    useAdminInfiniteQuery<NotificationTemplate>({
      queryKey,
      pageSize: 500,
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

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{
        activeTabId: "templates",
        searchValue: search,
        onSearchChange: setSearch,
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
          hasMore={false}
          isFetchingMore={false}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={() => {}}
          summaryLabel={t("templates.summary", {
            loaded: items.length,
          })}
        />
      </div>
    </AdminShell>
  );
}
