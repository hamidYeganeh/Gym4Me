"use client";

import { Spinner } from "@heroui/react/spinner";
import type {
  AccountDeletionRequest,
  ConsentHistoryEvent,
  ProgressExportPayload,
} from "@repo/api";
import { useCallback, useEffect, useState } from "react";
import { accountProfile, accountProgress } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AthleteDataRightsScreen } from "../screens/AthleteDataRightsScreen";

function downloadJson(payload: ProgressExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `gym4me-progress-export-${payload.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AthleteDataRightsGate() {
  const { isAuthenticated, isReady, logout } = useAuth();
  const [events, setEvents] = useState<ConsentHistoryEvent[] | null>(null);
  const [pending, setPending] = useState(false);
  const [deletionRequest, setDeletionRequest] =
    useState<AccountDeletionRequest | null>(null);
  const [lastExportSummary, setLastExportSummary] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      return;
    }
    const [history, deletion] = await Promise.all([
      accountProgress.consentHistory(),
      accountProfile.getAccountDeletionRequest(),
    ]);
    setEvents(history.items);
    setDeletionRequest(deletion);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;
    void load().catch(() => setEvents([]));
  }, [isReady, load]);

  if (!events) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AthleteDataRightsScreen
      consentEvents={events}
      deletionRequest={deletionRequest}
      lastExportSummary={lastExportSummary}
      onDeleteMetrics={async () => {
        setPending(true);
        try {
          const result = await accountProgress.deleteMetricsDataRights({
            confirmation: "DELETE_METRICS",
          });
          await load();
          return result;
        } finally {
          setPending(false);
        }
      }}
      onExport={async () => {
        setPending(true);
        try {
          const payload = await accountProgress.exportProgress();
          downloadJson(payload);
          setLastExportSummary(
            `${payload.metrics.length} متریک · ${payload.photos.length} عکس · ${payload.grants.length} دسترسی · ${payload.goals.length} هدف`,
          );
        } finally {
          setPending(false);
        }
      }}
      onRequestAccountDeletion={async (reason) => {
        setPending(true);
        try {
          await accountProfile.requestAccountDeletion({
            confirmation: "DELETE_ACCOUNT",
            reason,
          });
          await logout({ revoke: false });
        } finally {
          setPending(false);
        }
      }}
      onCancelAccountDeletion={async () => {
        setPending(true);
        try {
          setDeletionRequest(
            await accountProfile.cancelAccountDeletion({
              confirmation: "KEEP_ACCOUNT",
            }),
          );
        } finally {
          setPending(false);
        }
      }}
      pending={pending}
    />
  );
}
