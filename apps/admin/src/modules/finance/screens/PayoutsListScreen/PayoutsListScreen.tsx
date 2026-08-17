import { useCallback, useMemo, useState } from "react";
import type { Payout, PayoutStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminFinance } from "@/shared/lib/api";
import { PayoutsListFiltersSection } from "../../sections/PayoutsListFiltersSection";
import { PayoutsListHeaderSection } from "../../sections/PayoutsListHeaderSection";
import { PayoutsListModalsSection } from "../../sections/PayoutsListModalsSection";
import { PayoutsListTableSection } from "../../sections/PayoutsListTableSection";
import { payoutsListScreenVariants } from "./PayoutsListScreen.styles";
import type { PayoutsListScreenProps } from "./PayoutsListScreen.types";

const PAGE_SIZE = 30;

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

  const openDraft = () => {
    setDraftClubId("");
    setDraftFrom("");
    setDraftTo("");
    setActionError(null);
    setDraftOpen(true);
  };

  return (
    <AdminShell
      activeNavId="finance"
      className={className}
      financeSection={{ activeTabId: "payouts" }}
    >
      <div className={styles.content()}>
        <PayoutsListHeaderSection
          onDraftOpen={openDraft}
          onRefresh={() => void reload()}
        />

        <PayoutsListFiltersSection
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <PayoutsListTableSection
          error={error}
          fetchingMore={fetchingMore}
          hasMore={hasMore}
          items={items}
          loading={loading}
          total={total}
          onDispute={(row) => {
            setDisputing(row);
            setDisputeReason("");
            setActionError(null);
          }}
          onLoadMore={loadMore}
          onResolve={(row) => {
            setResolving(row);
            setResolveNote("");
            setActionError(null);
          }}
          onSettle={(row) => {
            setSettling(row);
            setActionError(null);
          }}
        />
      </div>

      <PayoutsListModalsSection
        actionError={actionError}
        actionPending={actionPending}
        disputing={disputing}
        disputeReason={disputeReason}
        draftClubId={draftClubId}
        draftFrom={draftFrom}
        draftOpen={draftOpen}
        draftTo={draftTo}
        resolveNote={resolveNote}
        resolving={resolving}
        settling={settling}
        onDisputeConfirm={() => {
          if (!disputing) return;
          void runAction(() =>
            adminFinance.openPayoutDispute(
              disputing._id,
              disputeReason.trim(),
            ),
          );
        }}
        onDisputeReasonChange={setDisputeReason}
        onDisputingOpenChange={(open) => {
          if (!open) setDisputing(null);
        }}
        onDraftClubIdChange={setDraftClubId}
        onDraftConfirm={() => {
          if (!draftClubId.trim() || !draftFrom.trim() || !draftTo.trim()) {
            return;
          }
          void runAction(() =>
            adminFinance.draftPeriodPayout({
              clubId: draftClubId.trim(),
              recipientType: "club",
              recipientId: draftClubId.trim(),
              periodFrom: draftFrom.trim(),
              periodTo: draftTo.trim(),
            }),
          );
        }}
        onDraftFromChange={setDraftFrom}
        onDraftOpenChange={setDraftOpen}
        onDraftToChange={setDraftTo}
        onResolveAccept={() => {
          if (!resolving) return;
          void runAction(() =>
            adminFinance.resolvePayoutDispute(resolving._id, {
              resolution: "resolved",
              note: resolveNote.trim() || undefined,
            }),
          );
        }}
        onResolveNoteChange={setResolveNote}
        onResolveReject={() => {
          if (!resolving) return;
          void runAction(() =>
            adminFinance.resolvePayoutDispute(resolving._id, {
              resolution: "rejected",
              note: resolveNote.trim() || undefined,
            }),
          );
        }}
        onResolvingOpenChange={(open) => {
          if (!open) setResolving(null);
        }}
        onSettleConfirm={() => {
          if (!settling) return;
          void runAction(() => adminFinance.settlePayout(settling._id));
        }}
        onSettlingOpenChange={(open) => {
          if (!open) setSettling(null);
        }}
      />
    </AdminShell>
  );
}
