import { useCallback, useMemo, useState } from "react";
import { Button, Chip, Typography } from "@heroui/react";
import type { PaymentRecord, PaymentStatus } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable, AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminFinance } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { paymentsListScreenVariants } from "./PaymentsListScreen.styles";
import type { PaymentsListScreenProps } from "./PaymentsListScreen.types";

const PAGE_SIZE = 30;
const STATUSES: Array<PaymentStatus | "all"> = [
  "all",
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
  "cancelled",
];

const columnHelper = createColumnHelper<PaymentRecord>();

export function PaymentsListScreen({ className }: PaymentsListScreenProps) {
  const t = useTranslations("Admin.Finance");
  const styles = paymentsListScreenVariants();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, pageSize: PAGE_SIZE }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminFinance.listPayments({
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
  } = useAdminInfiniteQuery<PaymentRecord>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("payments.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor((row) => row.reference.orderId, {
          id: "orderId",
          header: t("payments.columns.orderId"),
        }),
        columnHelper.accessor("purpose", {
          header: t("payments.columns.purpose"),
        }),
        columnHelper.accessor("channel", {
          header: t("payments.columns.channel"),
        }),
        columnHelper.accessor("status", {
          header: t("payments.columns.status"),
          cell: ({ getValue }) => {
            const status = getValue();
            const color =
              status === "captured"
                ? "success"
                : status === "failed" || status === "cancelled"
                  ? "danger"
                  : "warning";
            return (
              <Chip color={color} size="sm" variant="soft">
                <Chip.Label>{status}</Chip.Label>
              </Chip>
            );
          },
        }),
        columnHelper.accessor((row) => row.amount.gross, {
          id: "gross",
          header: t("payments.columns.gross"),
          cell: ({ getValue }) => (
            <span className="tabular-nums">
              {Number(getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.amount.net ?? "—", {
          id: "net",
          header: t("payments.columns.net"),
          cell: ({ getValue }) => {
            const value = getValue();
            return (
              <span className="tabular-nums">
                {typeof value === "number"
                  ? value.toLocaleString("fa-IR")
                  : value}
              </span>
            );
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("payments.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
      ] as ColumnDef<PaymentRecord, unknown>[],
    [t],
  );

  return (
    <AdminShell
      activeNavId="finance"
      className={className}
      financeSection={{ activeTabId: "payments" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("payments.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("payments.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((status) => (
            <FilterChip
              key={status}
              onPress={() => setStatusFilter(status)}
              selected={statusFilter === status}
            >
              {status === "all" ? t("filterAll") : status}
            </FilterChip>
          ))}
        </div>

        <AdminDataTable
          ariaLabel={t("payments.title")}
          columns={columns}
          data={items}
          emptyLabel={t("payments.empty")}
          error={error}
          getRowId={(row) => row._id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          onLoadMore={loadMore}
          summaryLabel={t("payments.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>
    </AdminShell>
  );
}
