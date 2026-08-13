import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { SocialReport, SocialReportStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminSocial } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { socialReportsScreenVariants } from "./SocialReportsScreen.styles";
import type { SocialReportsScreenProps } from "./SocialReportsScreen.types";

const PAGE_SIZE = 30;
const STATUSES: Array<SocialReportStatus | "all"> = [
  "all",
  "open",
  "resolved",
  "rejected",
];

const columnHelper = createColumnHelper<SocialReport>();

type ReportTableMeta = {
  actionsClassName: string;
  onResolve: (row: SocialReport, resolution: "resolved" | "rejected") => void;
};

export function SocialReportsScreen({ className }: SocialReportsScreenProps) {
  const t = useTranslations("Admin.Ops");
  const styles = socialReportsScreenVariants();

  const [statusFilter, setStatusFilter] = useState<SocialReportStatus | "all">(
    "open",
  );
  const [resolving, setResolving] = useState<{
    report: SocialReport;
    resolution: "resolved" | "rejected";
  } | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, pageSize: PAGE_SIZE }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminSocial.listReports({
        page,
        page_size: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
    },
    [statusFilter],
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
  } = useAdminInfiniteQuery<SocialReport>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("social.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor(
          (row) => `${row.target.kind}:${row.target.id}`,
          {
            id: "target",
            header: t("social.columns.target"),
            cell: ({ getValue }) => (
              <span className="block max-w-52 truncate" dir="ltr">
                {getValue()}
              </span>
            ),
          },
        ),
        columnHelper.accessor("reason", {
          header: t("social.columns.reason"),
          cell: ({ getValue }) => (
            <span className="block max-w-56 truncate">{getValue()}</span>
          ),
        }),
        columnHelper.accessor("reporterId", {
          header: t("social.columns.reporter"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("social.columns.status"),
          cell: ({ getValue }) => {
            const status = getValue();
            const color =
              status === "open"
                ? "warning"
                : status === "resolved"
                  ? "success"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                <Chip.Label>{status}</Chip.Label>
              </Chip>
            );
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("social.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: t("social.columns.actions"),
          size: 210,
          cell: (info) => {
            const meta = info.table.options.meta as
              | ReportTableMeta
              | undefined;
            if (!meta) return null;
            const row = info.row.original;
            if (row.status !== "open") return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => meta.onResolve(row, "resolved")}
                >
                  {t("social.actions.resolve")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onResolve(row, "rejected")}
                >
                  {t("social.actions.reject")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<SocialReport, unknown>[],
    [t],
  );

  const meta: ReportTableMeta = {
    actionsClassName: styles.actions(),
    onResolve: (report, resolution) => {
      setResolving({ report, resolution });
      setNote("");
      setActionError(null);
    },
  };

  const handleResolve = async () => {
    if (!resolving) return;
    setPending(true);
    setActionError(null);
    try {
      await adminSocial.resolveReport(resolving.report.id, {
        status: resolving.resolution,
        note: note.trim() || undefined,
      });
      setResolving(null);
      void reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="ops"
      className={className}
      opsSection={{ activeTabId: "social" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("social.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("social.subtitle")}
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
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("social.title")}
          columns={columns}
          data={items}
          emptyLabel={t("social.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("social.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={Boolean(resolving)}
        title={t("social.actions.resolveTitle")}
        onOpenChange={(open) => {
          if (!open) setResolving(null);
        }}
      >
        <div className={styles.form()}>
          <Typography className={styles.subtitle()}>
            {t("social.actions.resolveBody")}
          </Typography>
          <TextField
            className={styles.field()}
            fullWidth
            name="note"
            value={note}
            onChange={setNote}
          >
            <Label>{t("social.actions.noteLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={pending}
              variant={
                resolving?.resolution === "resolved" ? "primary" : "danger"
              }
              onPress={() => void handleResolve()}
            >
              {resolving?.resolution === "resolved"
                ? t("social.actions.resolve")
                : t("social.actions.reject")}
            </Button>
            <Button
              isDisabled={pending}
              variant="secondary"
              onPress={() => setResolving(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>
    </AdminShell>
  );
}
