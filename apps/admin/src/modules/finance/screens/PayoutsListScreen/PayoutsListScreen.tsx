import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type { Payout, PayoutStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminFinance } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { payoutsListScreenVariants } from "./PayoutsListScreen.styles";
import type { PayoutsListScreenProps } from "./PayoutsListScreen.types";

const PAGE_SIZE = 30;
const STATUSES: Array<PayoutStatus | "all"> = [
  "all",
  "pending",
  "processing",
  "settled",
  "disputed",
  "cancelled",
];

const columnHelper = createColumnHelper<Payout>();

type PayoutTableMeta = {
  actionsClassName: string;
  onSettle: (row: Payout) => void;
  onDispute: (row: Payout) => void;
  onResolve: (row: Payout) => void;
};

export function PayoutsListScreen({ className }: PayoutsListScreenProps) {
  const t = useTranslations("Admin.Finance");
  const styles = payoutsListScreenVariants();

  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">(
    "all",
  );
  const [settling, setSettling] = useState<Payout | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftClubId, setDraftClubId] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  const [disputing, setDisputing] = useState<Payout | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const [resolving, setResolving] = useState<Payout | null>(null);
  const [resolveNote, setResolveNote] = useState("");

  const queryKey = useMemo(
    () => JSON.stringify({ statusFilter, pageSize: PAGE_SIZE }),
    [statusFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminFinance.listPayouts({
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
  } = useAdminInfiniteQuery<Payout>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("payouts.errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor(
          (row) => `${row.recipient.type}:${row.recipient.id}`,
          {
            id: "recipient",
            header: t("payouts.columns.recipient"),
            cell: ({ getValue }) => (
              <span className="block max-w-48 truncate" dir="ltr">
                {getValue()}
              </span>
            ),
          },
        ),
        columnHelper.accessor("amount", {
          header: t("payouts.columns.amount"),
          cell: ({ getValue }) => (
            <span className="tabular-nums">
              {Number(getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
        columnHelper.accessor(
          (row) =>
            `${formatAdminDate(row.period.from)} – ${formatAdminDate(row.period.to)}`,
          {
            id: "period",
            header: t("payouts.columns.period"),
          },
        ),
        columnHelper.accessor("status", {
          header: t("payouts.columns.status"),
          cell: ({ getValue }) => {
            const status = getValue();
            const color =
              status === "settled"
                ? "success"
                : status === "disputed" || status === "cancelled"
                  ? "danger"
                  : "warning";
            return (
              <Chip color={color} size="sm" variant="soft">
                <Chip.Label>{status}</Chip.Label>
              </Chip>
            );
          },
        }),
        columnHelper.accessor("createdAt", {
          header: t("payouts.columns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: t("payouts.columns.actions"),
          size: 220,
          cell: (info) => {
            const meta = info.table.options.meta as PayoutTableMeta | undefined;
            if (!meta) return null;
            const row = info.row.original;
            return (
              <div className={meta.actionsClassName}>
                {row.status === "pending" || row.status === "processing" ? (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => meta.onSettle(row)}
                    >
                      {t("payouts.actions.settle")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => meta.onDispute(row)}
                    >
                      {t("payouts.actions.dispute")}
                    </Button>
                  </>
                ) : null}
                {row.status === "disputed" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => meta.onResolve(row)}
                  >
                    {t("payouts.actions.resolve")}
                  </Button>
                ) : null}
              </div>
            );
          },
        }),
      ] as ColumnDef<Payout, unknown>[],
    [t],
  );

  const meta: PayoutTableMeta = {
    actionsClassName: styles.actions(),
    onSettle: (row) => {
      setSettling(row);
      setActionError(null);
    },
    onDispute: (row) => {
      setDisputing(row);
      setDisputeReason("");
      setActionError(null);
    },
    onResolve: (row) => {
      setResolving(row);
      setResolveNote("");
      setActionError(null);
    },
  };

  const runAction = async (action: () => Promise<unknown>) => {
    setActionPending(true);
    setActionError(null);
    try {
      await action();
      setSettling(null);
      setDisputing(null);
      setResolving(null);
      setDraftOpen(false);
      void reload();
      return true;
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
      return false;
    } finally {
      setActionPending(false);
    }
  };

  const handleDraft = () => {
    if (!draftClubId.trim() || !draftFrom.trim() || !draftTo.trim()) return;
    void runAction(() =>
      adminFinance.draftPeriodPayout({
        clubId: draftClubId.trim(),
        recipientType: "club",
        recipientId: draftClubId.trim(),
        periodFrom: draftFrom.trim(),
        periodTo: draftTo.trim(),
      }),
    );
  };

  const handleResolve = (accept: boolean) => {
    if (!resolving) return;
    void runAction(() =>
      adminFinance.resolvePayoutDispute(resolving._id, {
        resolution: accept ? "resolved" : "rejected",
        note: resolveNote.trim() || undefined,
      }),
    );
  };

  return (
    <AdminShell
      activeNavId="finance"
      className={className}
      financeSection={{ activeTabId: "payouts" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("payouts.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("payouts.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => {
                setDraftClubId("");
                setDraftFrom("");
                setDraftTo("");
                setActionError(null);
                setDraftOpen(true);
              }}
            >
              {t("payouts.actions.draft")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
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
          ariaLabel={t("payouts.title")}
          columns={columns}
          data={items}
          emptyLabel={t("payouts.empty")}
          error={error}
          getRowId={(row) => row._id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          onLoadMore={loadMore}
          summaryLabel={t("payouts.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>

      <AdminFormDrawer
        isOpen={draftOpen}
        title={t("payouts.actions.draftTitle")}
        onOpenChange={setDraftOpen}
      >
        <div className={styles.form()}>
          <Typography className={styles.subtitle()}>
            {t("payouts.actions.draftBody")}
          </Typography>
          <TextField
            className={styles.field()}
            fullWidth
            name="clubId"
            value={draftClubId}
            onChange={setDraftClubId}
          >
            <Label>{t("payouts.actions.clubIdLabel")}</Label>
            <Input dir="ltr" />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="from"
            value={draftFrom}
            onChange={setDraftFrom}
          >
            <Label>{t("payouts.actions.fromLabel")}</Label>
            <Input dir="ltr" placeholder="2026-01-01" />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="to"
            value={draftTo}
            onChange={setDraftTo}
          >
            <Label>{t("payouts.actions.toLabel")}</Label>
            <Input dir="ltr" placeholder="2026-01-31" />
          </TextField>

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={
                actionPending ||
                !draftClubId.trim() ||
                !draftFrom.trim() ||
                !draftTo.trim()
              }
              variant="primary"
              onPress={handleDraft}
            >
              {t("payouts.actions.confirm")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => setDraftOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminFormDrawer
        isOpen={Boolean(disputing)}
        title={t("payouts.actions.disputeTitle")}
        onOpenChange={(open) => {
          if (!open) setDisputing(null);
        }}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="disputeReason"
            value={disputeReason}
            onChange={setDisputeReason}
          >
            <Label>{t("payouts.actions.disputeReasonLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={actionPending || !disputeReason.trim()}
              variant="primary"
              onPress={() => {
                if (!disputing) return;
                void runAction(() =>
                  adminFinance.openPayoutDispute(
                    disputing._id,
                    disputeReason.trim(),
                  ),
                );
              }}
            >
              {t("payouts.actions.confirm")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => setDisputing(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminFormDrawer
        isOpen={Boolean(resolving)}
        title={t("payouts.actions.resolveTitle")}
        onOpenChange={(open) => {
          if (!open) setResolving(null);
        }}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="resolveNote"
            value={resolveNote}
            onChange={setResolveNote}
          >
            <Label>{t("payouts.actions.noteLabel")}</Label>
            <Input />
          </TextField>

          {actionError ? (
            <p className="text-sm text-danger" role="alert">
              {actionError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={actionPending}
              variant="primary"
              onPress={() => handleResolve(true)}
            >
              {t("payouts.actions.resolveAccept")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="danger"
              onPress={() => handleResolve(false)}
            >
              {t("payouts.actions.resolveReject")}
            </Button>
            <Button
              isDisabled={actionPending}
              variant="secondary"
              onPress={() => setResolving(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("payouts.actions.settleBody")}</p>
            {actionError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {actionError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("payouts.actions.settle")}
        confirmVariant="primary"
        isOpen={Boolean(settling)}
        isPending={actionPending}
        title={t("payouts.actions.settleTitle")}
        onConfirm={() => {
          if (!settling) return;
          void runAction(() => adminFinance.settlePayout(settling._id));
        }}
        onOpenChange={(open) => {
          if (!open) setSettling(null);
        }}
      />
    </AdminShell>
  );
}
