import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  GamificationOverview,
  GamificationSubjectType,
  PointTransactionItem,
  PointTransactionReason,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { PointsLedgerAdjustDrawerSection } from "../../sections/PointsLedgerAdjustDrawerSection";
import { PointsLedgerFiltersSection } from "../../sections/PointsLedgerFiltersSection";
import { PointsLedgerHeaderSection } from "../../sections/PointsLedgerHeaderSection";
import { PointsLedgerOverviewSection } from "../../sections/PointsLedgerOverviewSection";
import { PointsLedgerTableSection } from "../../sections/PointsLedgerTableSection";
import { pointsLedgerScreenVariants } from "./PointsLedgerScreen.styles";
import type { PointsLedgerScreenProps } from "./PointsLedgerScreen.types";

const PAGE_SIZE = 40;
const FILTER_KEYS = ["subjectType", "reason", "subjectId", "ruleId"] as const;

type PointsLedgerFilters = {
  subjectType: GamificationSubjectType | "all";
  reason: PointTransactionReason | "all";
  subjectId: string;
  ruleId: string;
};

const FILTER_DEFAULTS: PointsLedgerFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  subjectType: "all",
  reason: "all",
  subjectId: "",
  ruleId: "",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

export function PointsLedgerScreen({ className }: PointsLedgerScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerScreenVariants();

  const { filters, setFilter,
    page,
    pageSize,
    setPage,
  } =
    useAdminListQueryParams<PointsLedgerFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });

  const [overview, setOverview] = useState<GamificationOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustSubjectType, setAdjustSubjectType] =
    useState<GamificationSubjectType>("athlete");
  const [adjustSubjectId, setAdjustSubjectId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustPending, setAdjustPending] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setOverviewError(null);
    try {
      setOverview(await adminGamification.overview());
    } catch (err) {
      setOverviewError(
        err instanceof ApiError ? err.message : t("errorLoad"),
      );
    }
  }, [t]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const queryKey = useMemo(
    () => JSON.stringify({ filters, pageSize }),
    [filters, pageSize],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminGamification.listTransactions({
        page,
        page_size: pageSize,
        subjectType:
          filters.subjectType === "all" ? undefined : filters.subjectType,
        reason: filters.reason === "all" ? undefined : filters.reason,
        subjectId: filters.subjectId.trim() || undefined,
        ruleId: filters.ruleId.trim() || undefined,
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
  } = useAdminPaginatedQuery<PointTransactionItem>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const amountValue = Number.parseInt(adjustAmount, 10);
  const canAdjust =
    adjustSubjectId.trim().length > 0 &&
    Number.isFinite(amountValue) &&
    amountValue !== 0 &&
    adjustNote.trim().length > 0;

  const openAdjust = () => {
    setAdjustSubjectType("athlete");
    setAdjustSubjectId("");
    setAdjustAmount("");
    setAdjustNote("");
    setAdjustError(null);
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    if (!canAdjust) return;
    setAdjustPending(true);
    setAdjustError(null);
    try {
      await adminGamification.adjustPoints({
        subjectType: adjustSubjectType,
        subjectId: adjustSubjectId.trim(),
        amount: amountValue,
        note: adjustNote.trim(),
      });
      setAdjustOpen(false);
      void reload();
      void loadOverview();
    } catch (err) {
      setAdjustError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setAdjustPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{ activeTabId: "ledger" }}
    >
      <div className={styles.content()}>
        <PointsLedgerHeaderSection
          onAdjustOpen={openAdjust}
          onRefresh={() => {
            void reload();
            void loadOverview();
          }}
        />

        <PointsLedgerOverviewSection
          overview={overview}
          overviewError={overviewError}
        />

        <PointsLedgerFiltersSection
          reasonFilter={filters.reason}
          ruleId={filters.ruleId}
          subjectFilter={filters.subjectType}
          subjectId={filters.subjectId}
          onReasonChange={(value) => setFilter("reason", value)}
          onRuleIdChange={(value) => setFilter("ruleId", value)}
          onSubjectChange={(value) => setFilter("subjectType", value)}
          onSubjectIdChange={(value) => setFilter("subjectId", value)}
        />

        <PointsLedgerTableSection
          error={error}
          items={items}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={changePage}
        />
      </div>

      <PointsLedgerAdjustDrawerSection
        amount={adjustAmount}
        canAdjust={canAdjust}
        error={adjustError}
        isOpen={adjustOpen}
        note={adjustNote}
        pending={adjustPending}
        subjectId={adjustSubjectId}
        subjectType={adjustSubjectType}
        onAmountChange={setAdjustAmount}
        onCancel={() => setAdjustOpen(false)}
        onConfirm={() => void handleAdjust()}
        onNoteChange={setAdjustNote}
        onOpenChange={setAdjustOpen}
        onSubjectIdChange={setAdjustSubjectId}
        onSubjectTypeChange={setAdjustSubjectType}
      />
    </AdminShell>
  );
}
