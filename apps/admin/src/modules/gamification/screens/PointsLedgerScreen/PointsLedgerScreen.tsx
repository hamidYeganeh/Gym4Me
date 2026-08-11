import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  GamificationOverview,
  GamificationSubjectType,
  PointTransactionItem,
  PointTransactionReason,
} from "@repo/api";
import { ApiError } from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDataTable,
  AdminFormDrawer,
  AdminShell,
} from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminGamification } from "@/shared/lib/api";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { pointsLedgerScreenVariants } from "./PointsLedgerScreen.styles";
import type { PointsLedgerScreenProps } from "./PointsLedgerScreen.types";

const PAGE_SIZE = 40;

const REASONS: PointTransactionReason[] = [
  "rule_award",
  "achievement_bonus",
  "admin_adjustment",
  "redemption",
  "expiry",
];

const columnHelper = createColumnHelper<PointTransactionItem>();

export function PointsLedgerScreen({ className }: PointsLedgerScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointsLedgerScreenVariants();

  const [subjectFilter, setSubjectFilter] = useState<
    GamificationSubjectType | "all"
  >("all");
  const [reasonFilter, setReasonFilter] = useState<
    PointTransactionReason | "all"
  >("all");

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
    () => JSON.stringify({ subjectFilter, reasonFilter, pageSize: PAGE_SIZE }),
    [subjectFilter, reasonFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminGamification.listTransactions({
        page,
        page_size: pageSize,
        subjectType: subjectFilter === "all" ? undefined : subjectFilter,
        reason: reasonFilter === "all" ? undefined : reasonFilter,
      });
    },
    [subjectFilter, reasonFilter],
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
  } = useAdminInfiniteQuery<PointTransactionItem>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor((row) => row.subject, {
          id: "subject",
          header: t("ledger.columns.subject"),
          size: 220,
          enableSorting: false,
          cell: (info) => {
            const subject = info.getValue();
            return (
              <span className="text-sm">
                {t(`subjects.${subject.type}`)}
                <span className="ms-1 font-mono text-xs text-muted" dir="ltr">
                  {subject.id}
                </span>
              </span>
            );
          },
        }),
        columnHelper.accessor("amount", {
          header: t("ledger.columns.amount"),
          size: 90,
          enableSorting: false,
          cell: (info) => {
            const amount = info.getValue();
            return (
              <span
                className={
                  amount >= 0
                    ? "tabular-nums text-success"
                    : "tabular-nums text-danger"
                }
              >
                {amount > 0 ? `+${amount}` : amount}
              </span>
            );
          },
        }),
        columnHelper.accessor("reason", {
          header: t("ledger.columns.reason"),
          size: 130,
          enableSorting: false,
          cell: (info) => (
            <Chip color="default" size="sm" variant="soft">
              {t(`reasons.${info.getValue()}`)}
            </Chip>
          ),
        }),
        columnHelper.accessor("note", {
          header: t("ledger.columns.note"),
          size: 180,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate text-sm text-muted">
              {info.getValue() ?? "—"}
            </span>
          ),
        }),
        columnHelper.accessor("occurredAt", {
          header: t("ledger.columns.occurredAt"),
          size: 150,
          enableSorting: false,
          cell: (info) => (
            <span className="text-sm text-muted" dir="ltr">
              {new Date(info.getValue()).toLocaleString("fa-IR")}
            </span>
          ),
        }),
      ] as ColumnDef<PointTransactionItem, unknown>[],
    [t],
  );

  const amountValue = Number.parseInt(adjustAmount, 10);
  const canAdjust =
    adjustSubjectId.trim().length > 0 &&
    Number.isFinite(amountValue) &&
    amountValue !== 0 &&
    adjustNote.trim().length > 0;

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
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("ledger.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("ledger.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            <Button
              size="sm"
              variant="primary"
              onPress={() => {
                setAdjustSubjectType("athlete");
                setAdjustSubjectId("");
                setAdjustAmount("");
                setAdjustNote("");
                setAdjustError(null);
                setAdjustOpen(true);
              }}
            >
              {t("ledger.actions.adjust")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                void reload();
                void loadOverview();
              }}
            >
              {t("refresh")}
            </Button>
          </div>
        </section>

        {overviewError ? (
          <p className="text-sm text-danger" role="alert">
            {overviewError}
          </p>
        ) : null}

        {overview ? (
          <>
            <div className={styles.statsGrid()}>
              {(
                [
                  ["earned", overview.totals.earned],
                  ["spent", overview.totals.spent],
                  ["transactions", overview.totals.transactions],
                  ["grants", overview.totals.grants],
                ] as const
              ).map(([key, value]) => (
                <Card key={key} className="p-4">
                  <span className={styles.statValue()}>
                    {value.toLocaleString("fa-IR")}
                  </span>
                  <span className={styles.statLabel()}>
                    {t(`ledger.stats.${key}`)}
                  </span>
                </Card>
              ))}
            </div>

            <div className={styles.breakdownGrid()}>
              <Card className="p-4">
                <Typography className="mb-3 font-bold">
                  {t("ledger.byReason")}
                </Typography>
                <div className={styles.breakdownList()}>
                  {overview.byReason.length === 0 ? (
                    <span className="text-sm text-muted">
                      {t("ledger.emptyBreakdown")}
                    </span>
                  ) : (
                    overview.byReason.map((row) => (
                      <div key={row.reason} className={styles.breakdownRow()}>
                        <span>{t(`reasons.${row.reason}`)}</span>
                        <span className="tabular-nums">
                          {row.total.toLocaleString("fa-IR")} (
                          {row.count.toLocaleString("fa-IR")})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <Typography className="mb-3 font-bold">
                  {t("ledger.byRule")}
                </Typography>
                <div className={styles.breakdownList()}>
                  {overview.byRule.length === 0 ? (
                    <span className="text-sm text-muted">
                      {t("ledger.emptyBreakdown")}
                    </span>
                  ) : (
                    overview.byRule.map((row) => (
                      <div key={row.ruleId} className={styles.breakdownRow()}>
                        <span className="truncate">
                          {row.title ??
                            (row.event ? t(`events.${row.event}`) : row.ruleId)}
                        </span>
                        <span className="tabular-nums">
                          {row.total.toLocaleString("fa-IR")} (
                          {row.count.toLocaleString("fa-IR")})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        ) : null}

        <section className={styles.actions()}>
          {(["all", ...SUBJECT_TYPES] as const).map((value) => (
            <FilterChip
              key={value}
              onPress={() => setSubjectFilter(value)}
              selected={subjectFilter === value}
            >
              {value === "all" ? t("filterAll") : t(`subjects.${value}`)}
            </FilterChip>
          ))}
          {(["all", ...REASONS] as const).map((value) => (
            <FilterChip
              key={`reason-${value}`}
              onPress={() => setReasonFilter(value)}
              selected={reasonFilter === value}
            >
              {value === "all" ? t("filterAllReasons") : t(`reasons.${value}`)}
            </FilterChip>
          ))}
        </section>

        <AdminDataTable
          ariaLabel={t("ledger.title")}
          columns={columns}
          data={items}
          emptyLabel={t("ledger.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          summaryLabel={t("infinite.summary", {
            loaded: items.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminFormDrawer
        className="max-w-xl sm:max-w-xl"
        isOpen={adjustOpen}
        title={t("ledger.actions.adjustTitle")}
        onOpenChange={setAdjustOpen}
      >
        <div className={styles.form()}>
          <div className={styles.field()}>
            <Label>{t("achievements.fields.subjectType")}</Label>
            <div className={styles.chips()}>
              {SUBJECT_TYPES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={adjustSubjectType === value ? "primary" : "secondary"}
                  onPress={() => setAdjustSubjectType(value)}
                >
                  {t(`subjects.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            className={styles.field()}
            fullWidth
            name="subjectId"
            value={adjustSubjectId}
            onChange={setAdjustSubjectId}
          >
            <Label>{t("achievements.fields.subjectId")}</Label>
            <Input dir="ltr" placeholder={t("achievements.fields.subjectIdHint")} />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="amount"
            value={adjustAmount}
            onChange={setAdjustAmount}
          >
            <Label>{t("ledger.fields.amount")}</Label>
            <Input dir="ltr" inputMode="numeric" placeholder={t("ledger.fields.amountHint")} />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="note"
            value={adjustNote}
            onChange={setAdjustNote}
          >
            <Label>{t("ledger.fields.note")}</Label>
            <Input placeholder={t("ledger.fields.noteHint")} />
          </TextField>

          {adjustError ? (
            <p className="text-sm text-danger" role="alert">
              {adjustError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={adjustPending || !canAdjust}
              variant="primary"
              onPress={() => void handleAdjust()}
            >
              {t("actions.save")}
            </Button>
            <Button
              isDisabled={adjustPending}
              variant="secondary"
              onPress={() => setAdjustOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>
    </AdminShell>
  );
}
