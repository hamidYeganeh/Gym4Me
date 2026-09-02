"use client";

import { Spinner } from "@heroui/react/spinner";
import { Typography } from "@heroui/react/typography";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { OfflineCheckinReconciliation } from "@repo/api/checkin";
import { accountCheckin, accountClubs } from "@/shared/lib/api";
import { isNetworkFailure } from "@/shared/lib/offline-queue";
import { useAuth } from "@/shared/providers/AuthProvider";
import { OwnerCheckInDeskScreen } from "../screens/OwnerCheckInDeskScreen";
import {
  offlineCheckinQueueCount,
  applyOfflineReconciliationResults,
  getOfflineCheckinQueueSummary,
  prepareOfflineCheckin,
  purgeExpiredOfflineCheckinState,
  queueOfflineBookingCheckin,
  resetOfflineCheckinState,
  syncOfflineCheckins,
} from "./offline-checkin-queue";

function resolutionMutationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `checkin-resolution-${crypto.randomUUID()}`;
  }
  return `checkin-resolution-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function OwnerCheckInDeskGate() {
  const { isAuthenticated, isReady, user } = useAuth();
  const t = useTranslations("OwnerCheckInDesk");
  const [clubId, setClubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [queueSummary, setQueueSummary] =
    useState<Awaited<ReturnType<typeof getOfflineCheckinQueueSummary>>>(null);
  const [recoveryPending, setRecoveryPending] = useState(false);
  const [reconciliations, setReconciliations] = useState<
    OfflineCheckinReconciliation[]
  >([]);
  const [reconciliationsLoading, setReconciliationsLoading] = useState(false);
  const [resolutionPendingId, setResolutionPendingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setClubId(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    accountClubs
      .list({ page_size: 1 })
      .then((clubs) => {
        if (!cancelled) setClubId(clubs.result[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setClubId(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady]);

  const refreshQueueState = useCallback(async () => {
    if (!clubId || !user?.id) return;
    await purgeExpiredOfflineCheckinState(clubId, user.id);
    setQueueSummary(await getOfflineCheckinQueueSummary(clubId, user.id));
    setQueueCount(await offlineCheckinQueueCount(clubId, user.id));
  }, [clubId, user?.id]);

  const refreshReconciliations = useCallback(async () => {
    if (!clubId || !user?.id) return;
    setReconciliationsLoading(true);
    try {
      const page = await accountCheckin.listOfflineReconciliations(clubId, {
        page_size: 100,
      });
      const actionable = page.result.filter((row) =>
        ["processing", "review", "rejected"].includes(row.status),
      );
      setReconciliations(actionable);
      await refreshQueueState();
      setQueueCount(
        await applyOfflineReconciliationResults(
          clubId,
          user.id,
          page.result,
        ),
      );
    } finally {
      setReconciliationsLoading(false);
    }
  }, [clubId, refreshQueueState, user?.id]);

  useEffect(() => {
    if (!clubId || !user?.id) return;
    let cancelled = false;
    const prepareAndSync = async () => {
      try {
        await prepareOfflineCheckin(clubId, user.id);
        const result = await syncOfflineCheckins(clubId, user.id);
        if (!cancelled) {
          if (result.needsRecovery) {
            setError(
              t(
                result.recoveryReason === "revoked_device"
                  ? "recoveryRevokedDevice"
                  : "recoveryStaleSnapshot",
              ),
            );
          }
          setQueueCount(result.remaining);
          await refreshQueueState();
          await refreshReconciliations();
        }
      } catch {
        if (!cancelled) {
          await refreshQueueState();
        }
      }
    };
    void prepareAndSync();
    const handleOnline = () => void prepareAndSync();
    window.addEventListener("online", handleOnline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
    };
  }, [clubId, refreshQueueState, refreshReconciliations, t, user?.id]);

  const handleRecoverQueue = useCallback(async () => {
    if (!clubId || !user?.id) return;
    setRecoveryPending(true);
    setError(null);
    try {
      await resetOfflineCheckinState(clubId, user.id);
      await prepareOfflineCheckin(clubId, user.id);
      await refreshQueueState();
      setMessage(t("recoveryDone"));
    } catch {
      setError(t("resolutionFailed"));
    } finally {
      setRecoveryPending(false);
    }
  }, [clubId, refreshQueueState, t, user?.id]);

  const handleResolve = useCallback(
    async (
      reconciliation: OfflineCheckinReconciliation,
      action: "retry" | "dismiss",
      reason: string,
    ) => {
      if (!clubId || !user?.id) return;
      setResolutionPendingId(reconciliation.id);
      setError(null);
      setMessage(null);
      try {
        const clientMutationId = resolutionMutationId();
        const resolved = await accountCheckin.resolveOfflineReconciliation(
          clubId,
          reconciliation.id,
          { action, reason, clientMutationId },
        );
        if (resolved.status === "accepted") {
          setMessage(t("resolutionAccepted"));
        } else if (resolved.status === "dismissed") {
          setMessage(t("resolutionDismissed"));
        } else {
          setError(t("resolutionStillNeedsReview"));
        }
        try {
          await refreshReconciliations();
        } catch {
          setError(t("reviewRefreshFailed"));
        }
      } catch {
        setError(t("resolutionFailed"));
      } finally {
        setResolutionPendingId(null);
      }
    },
    [clubId, refreshReconciliations, t, user?.id],
  );

  const handleSubmit = useCallback(
    async (code: string) => {
      if (!clubId || !user?.id) return;
      setPending(true);
      setMessage(null);
      setError(null);
      try {
        const checkIn = await accountCheckin.checkInByBookingCode(clubId, {
          code,
          method: "manual",
        });
        setMessage(t("success", { id: checkIn.id }));
        void prepareOfflineCheckin(clubId, user.id);
      } catch (caught) {
        if (isNetworkFailure(caught)) {
          const queued = await queueOfflineBookingCheckin(
            clubId,
            user.id,
            code,
          );
          if (queued.queued) {
            await refreshQueueState();
            setMessage(t(queued.duplicate ? "alreadyQueued" : "queuedOffline"));
          } else if (queued.reason === "stale_snapshot") {
            setError(t("recoveryStaleSnapshot"));
            await refreshQueueState();
          } else {
            setError(t("offlineNotEligible"));
          }
        } else {
          setError(t("invalidCode"));
        }
      } finally {
        setPending(false);
      }
    },
    [clubId, refreshQueueState, t, user?.id],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !clubId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-6 text-center">
        <Typography type="body">باشگاهی برای میز پذیرش پیدا نشد.</Typography>
      </div>
    );
  }

  return (
    <OwnerCheckInDeskScreen
      error={error}
      message={
        message ?? (queueCount > 0 ? t("queuePending", { count: queueCount }) : null)
      }
      onSubmit={handleSubmit}
      pending={pending}
      onResolve={handleResolve}
      queueSummary={
        queueSummary
          ? {
              queueDepth: queueSummary.queueDepth,
              needsRecovery: queueSummary.needsRecovery,
              recoveryReason: queueSummary.recoveryReason,
            }
          : null
      }
      onRecoverQueue={handleRecoverQueue}
      recoveryPending={recoveryPending}
      reconciliations={reconciliations}
      reconciliationsLoading={reconciliationsLoading}
      resolutionPendingId={resolutionPendingId}
    />
  );
}
