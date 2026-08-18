import { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type { AdminLedgerEntry } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable, AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminFinance } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { financeLedgerScreenVariants } from "./FinanceLedgerScreen.styles";
import type { FinanceLedgerScreenProps } from "./FinanceLedgerScreen.types";

const PAGE_SIZE = 40;
const KINDS = [
  "all",
  "payment",
  "refund",
  "payout",
  "wallet_topup",
  "wallet_spend",
  "adjustment",
] as const;

const columnHelper = createColumnHelper<AdminLedgerEntry>();

export function FinanceLedgerScreen({ className }: FinanceLedgerScreenProps) {
  const t = useTranslations("Admin.Finance");
  const styles = financeLedgerScreenVariants();
  const [kindFilter, setKindFilter] = useState<(typeof KINDS)[number]>("all");

  const queryKey = useMemo(
    () => JSON.stringify({ kindFilter, pageSize: PAGE_SIZE }),
    [kindFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminFinance.listLedger({
        page,
        page_size: pageSize,
        kind: kindFilter === "all" ? undefined : kindFilter,
      });
    },
    [kindFilter],
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
  } = useAdminInfiniteQuery<AdminLedgerEntry>({
    queryKey,
    pageSize: PAGE_SIZE,
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

        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((kind) => (
            <FilterChip
              key={kind}
              onPress={() => setKindFilter(kind)}
              selected={kindFilter === kind}
            >
              {kind === "all" ? t("filterAll") : kind}
            </FilterChip>
          ))}
        </div>

        <AdminDataTable
          ariaLabel={t("ledgerTitle")}
          columns={columns}
          data={items}
          emptyLabel={t("empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          onLoadMore={loadMore}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>
    </AdminShell>
  );
}
