import { useCallback, useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { AdminLedgerEntry, LedgerEntryKind } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDatePicker,
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
import { financeLedgerScreenVariants } from "./FinanceLedgerScreen.styles";
import type { FinanceLedgerScreenProps } from "./FinanceLedgerScreen.types";

const PAGE_SIZE = 40;
const FILTER_KEYS = ["kind", "clubId", "paymentId", "from", "to"] as const;

const LEDGER_KINDS: LedgerEntryKind[] = [
  "payment",
  "refund",
  "payout",
  "wallet_topup",
  "wallet_spend",
  "adjustment",
];

type FinanceLedgerFilters = {
  kind: LedgerEntryKind | "all";
  clubId: string;
  paymentId: string;
  from: string;
  to: string;
};

const FILTER_DEFAULTS: FinanceLedgerFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  kind: "all",
  clubId: "",
  paymentId: "",
  from: "",
  to: "",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

const columnHelper = createColumnHelper<AdminLedgerEntry>();

export function FinanceLedgerScreen({ className }: FinanceLedgerScreenProps) {
  const t = useTranslations("Admin.Finance");
  const tCommon = useTranslations("Admin.Common");
  const styles = financeLedgerScreenVariants();

  const { filters, setFilter, page, pageSize, setPage } =
    useAdminListQueryParams<FinanceLedgerFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const queryKey = useMemo(
    () => JSON.stringify({ filters, pageSize }),
    [filters, pageSize],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminFinance.listLedger({
        page,
        page_size: pageSize,
        kind: filters.kind === "all" ? undefined : filters.kind,
        clubId: filters.clubId.trim() || undefined,
        paymentId: filters.paymentId.trim() || undefined,
        from: filters.from.trim() || undefined,
        to: filters.to.trim() || undefined,
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
  } = useAdminPaginatedQuery<AdminLedgerEntry>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("kind", {
          header: t("columns.kind"),
          cell: ({ getValue }) => (
            <Chip size="sm" variant="soft">
              <Chip.Label>{getValue()}</Chip.Label>
            </Chip>
          ),
        }),
        columnHelper.accessor("occurredAt", {
          header: t("columns.occurredAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.accessor((row) => row.paymentId ?? "—", {
          id: "paymentId",
          header: t("columns.paymentId"),
        }),
        columnHelper.accessor(
          (row) => row.split?.net ?? row.split?.gross ?? "—",
          {
            id: "net",
            header: t("columns.net"),
          },
        ),
        columnHelper.accessor((row) => row.note ?? "—", {
          id: "note",
          header: t("columns.note"),
        }),
      ] as ColumnDef<AdminLedgerEntry, unknown>[],
    [t],
  );

  const summary = adminListPaginationSummary(page, pageSize, total);

  return (
    <AdminShell
      activeNavId="finance"
      className={className}
      financeSection={{ activeTabId: "ledger" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("ledgerTitle")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("ledgerSubtitle")}
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
            label={t("filters.kind")}
            options={LEDGER_KINDS.map((item) => ({
              value: item,
              label: t(`ledgerKind.${item}`),
            }))}
            value={filters.kind}
            onChange={(value) =>
              setFilter("kind", value as FinanceLedgerFilters["kind"])
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
            kind="payment"
            label={t("filters.paymentId")}
            value={filters.paymentId}
            onChange={(value) => setFilter("paymentId", value)}
          />
          <AdminDatePicker
            className={styles.field()}
            label={t("filters.from")}
            labelClassName={styles.label()}
            name="from"
            value={filters.from}
            onChange={(value) => setFilter("from", value)}
          />
          <AdminDatePicker
            className={styles.field()}
            label={t("filters.to")}
            labelClassName={styles.label()}
            name="to"
            value={filters.to}
            onChange={(value) => setFilter("to", value)}
          />
        </div>

        <AdminDataTable
          ariaLabel={t("ledgerTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("empty")}
          error={error}
          getRowId={(row) => row.id}
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
