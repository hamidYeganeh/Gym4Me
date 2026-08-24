import { useCallback, useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type {
  PaymentChannel,
  PaymentPurpose,
  PaymentRecord,
  PaymentStatus,
} from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDataTable,
  AdminFilterSelect,
  AdminModelAutocomplete,
  AdminShell,
} from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { adminFinance } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { paymentsListScreenVariants } from "./PaymentsListScreen.styles";
import type { PaymentsListScreenProps } from "./PaymentsListScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = [
  "status",
  "channel",
  "purpose",
  "clubId",
  "payerUserId",
] as const;

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
  "cancelled",
];
const PAYMENT_CHANNELS: PaymentChannel[] = [
  "zarinpal",
  "cash",
  "pos",
  "card_to_card",
  "wallet",
  "mixed",
];
const PAYMENT_PURPOSES: PaymentPurpose[] = [
  "booking",
  "membership",
  "wallet_topup",
  "package",
  "platform_subscription",
  "manual",
];

type PaymentsListFilters = {
  status: PaymentStatus | "all";
  channel: PaymentChannel | "all";
  purpose: PaymentPurpose | "all";
  clubId: string;
  payerUserId: string;
};

const FILTER_DEFAULTS: PaymentsListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  status: "all",
  channel: "all",
  purpose: "all",
  clubId: "",
  payerUserId: "",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

const columnHelper = createColumnHelper<PaymentRecord>();

export function PaymentsListScreen({ className }: PaymentsListScreenProps) {
  const t = useTranslations("Admin.Finance");
  const tCommon = useTranslations("Admin.Common");
  const styles = paymentsListScreenVariants();

  const { filters, setFilter, page, pageSize, setPage } =
    useAdminListQueryParams<PaymentsListFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const queryKey = useMemo(
    () => JSON.stringify({ filters, pageSize }),
    [filters, pageSize],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminFinance.listPayments({
        page,
        page_size: pageSize,
        status: filters.status === "all" ? undefined : filters.status,
        channel: filters.channel === "all" ? undefined : filters.channel,
        purpose: filters.purpose === "all" ? undefined : filters.purpose,
        clubId: filters.clubId.trim() || undefined,
        payerUserId: filters.payerUserId.trim() || undefined,
      });
    },
    [filters],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<PaymentRecord>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
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

  const summary = adminListPaginationSummary(page, pageSize, total);

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

        <div className={styles.filters()}>
          <AdminFilterSelect
            allLabel={t("filterAll")}
            label={t("filters.status")}
            options={PAYMENT_STATUSES.map((item) => ({
              value: item,
              label: t(`paymentStatus.${item}`),
            }))}
            value={filters.status}
            onChange={(value) =>
              setFilter("status", value as PaymentsListFilters["status"])
            }
          />
          <AdminFilterSelect
            allLabel={t("filterAll")}
            label={t("filters.channel")}
            options={PAYMENT_CHANNELS.map((item) => ({
              value: item,
              label: t(`paymentChannel.${item}`),
            }))}
            value={filters.channel}
            onChange={(value) =>
              setFilter("channel", value as PaymentsListFilters["channel"])
            }
          />
          <AdminFilterSelect
            allLabel={t("filterAll")}
            label={t("filters.purpose")}
            options={PAYMENT_PURPOSES.map((item) => ({
              value: item,
              label: t(`paymentPurpose.${item}`),
            }))}
            value={filters.purpose}
            onChange={(value) =>
              setFilter("purpose", value as PaymentsListFilters["purpose"])
            }
          />
          <AdminModelAutocomplete
            className={styles.field()}
            kind="club"
            label={t("filters.clubId")}
            value={filters.clubId}
            onChange={(value) => setFilter("clubId", value)}
          />
          <AdminModelAutocomplete
            className={styles.field()}
            kind="user"
            label={t("filters.payerUserId")}
            value={filters.payerUserId}
            onChange={(value) => setFilter("payerUserId", value)}
          />
        </div>

        <AdminDataTable
          ariaLabel={t("payments.title")}
          columns={columns}
          data={items}
          emptyLabel={t("payments.empty")}
          error={error}
          getRowId={(row) => row._id}
          isLoading={loading}
          loadingLabel={t("loading")}
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
