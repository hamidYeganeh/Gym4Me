import { useCallback, useMemo, useState } from "react";
import { Button, Typography } from "@heroui/react";
import type { Booking } from "@repo/api";
import { ApiError } from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminBookings } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { refundsListScreenVariants } from "./RefundsListScreen.styles";
import type { RefundsListScreenProps } from "./RefundsListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<Booking>();

type RefundTableMeta = {
  actionsClassName: string;
  onRefund: (row: Booking) => void;
};

export function RefundsListScreen({ className }: RefundsListScreenProps) {
  const t = useTranslations("Admin.Finance");
  const styles = refundsListScreenVariants();

  const [refunding, setRefunding] = useState<Booking | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPage = useCallback(async (page: number, pageSize: number) => {
    return adminBookings.list({
      page,
      page_size: pageSize,
      status: "refund_requested",
    });
  }, []);

  const {
    items,
    total,
    loading,
    fetchingMore,
    hasMore,
    error,
    loadMore,
    reload,
  } = useAdminInfiniteQuery<Booking>({
    queryKey: JSON.stringify({ status: "refund_requested" }),
    pageSize: PAGE_SIZE,
    errorFallback: t("refunds.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("code", {
          header: t("refunds.columns.code"),
        }),
        columnHelper.accessor((row) => row.club?.name ?? "—", {
          id: "club",
          header: t("refunds.columns.club"),
        }),
        columnHelper.accessor(
          (row) => row.resource.title ?? row.resource.type,
          {
            id: "resource",
            header: t("refunds.columns.resource"),
          },
        ),
        columnHelper.accessor((row) => row.pricing.total, {
          id: "total",
          header: t("refunds.columns.total"),
          cell: ({ getValue }) => (
            <span className="tabular-nums">
              {Number(getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
        columnHelper.accessor("startsAt", {
          header: t("refunds.columns.startsAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: t("refunds.columns.actions"),
          size: 120,
          cell: (info) => {
            const meta = info.table.options.meta as
              | RefundTableMeta
              | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => meta.onRefund(info.row.original)}
                >
                  {t("refunds.actions.refund")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<Booking, unknown>[],
    [t],
  );

  const meta: RefundTableMeta = {
    actionsClassName: styles.actions(),
    onRefund: (row) => {
      setRefunding(row);
      setActionError(null);
    },
  };

  const handleRefund = async () => {
    if (!refunding) return;
    setPending(true);
    setActionError(null);
    try {
      await adminBookings.refund(refunding.id);
      setRefunding(null);
      void reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="finance"
      className={className}
      financeSection={{ activeTabId: "refunds" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("refunds.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("refunds.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button onPress={() => void reload()} variant="outline">
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("refunds.title")}
          columns={columns}
          data={items}
          emptyLabel={t("refunds.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("refunds.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminConfirmDialog
        body={
          <>
            <Typography>{t("refunds.actions.refundBody")}</Typography>
            {actionError ? (
              <Typography className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </Typography>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("refunds.actions.refund")}
        confirmVariant="primary"
        isOpen={Boolean(refunding)}
        isPending={pending}
        title={t("refunds.actions.refundTitle")}
        onConfirm={() => void handleRefund()}
        onOpenChange={(open) => {
          if (!open) setRefunding(null);
        }}
      />
    </AdminShell>
  );
}
