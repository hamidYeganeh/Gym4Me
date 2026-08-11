import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  AdminPointRule,
  GamificationSubjectType,
  PointRuleEvent,
  PointRuleRepeat,
} from "@repo/api";
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
import { adminGamification } from "@/shared/lib/api";
import {
  POINT_RULE_EVENTS,
  POINT_RULE_REPEATS,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";
import { pointRulesListScreenVariants } from "./PointRulesListScreen.styles";
import type { PointRulesListScreenProps } from "./PointRulesListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminPointRule>();

type RuleTableMeta = {
  onEdit: (row: AdminPointRule) => void;
  onArchive: (row: AdminPointRule) => void;
  actionsClassName: string;
};

/** ISO date-time → value usable by `<input type="datetime-local">`. */
function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string) {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

type AwardsDraft = Record<GamificationSubjectType, string>;

const EMPTY_AWARDS: AwardsDraft = { athlete: "", coach: "", club: "" };

export function PointRulesListScreen({ className }: PointRulesListScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const styles = pointRulesListScreenVariants();

  const [eventFilter, setEventFilter] = useState<PointRuleEvent | "all">("all");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPointRule | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [event, setEvent] = useState<PointRuleEvent>("booking_completed");
  const [awards, setAwards] = useState<AwardsDraft>(EMPTY_AWARDS);
  const [repeat, setRepeat] = useState<PointRuleRepeat>("unlimited");
  const [dailyCap, setDailyCap] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [archiving, setArchiving] = useState<AdminPointRule | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const queryKey = useMemo(
    () => JSON.stringify({ eventFilter, pageSize: PAGE_SIZE }),
    [eventFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminGamification.listPointRules({
        page,
        page_size: pageSize,
        event: eventFilter === "all" ? undefined : eventFilter,
      });
    },
    [eventFilter],
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
  } = useAdminInfiniteQuery<AdminPointRule>({
    queryKey,
    pageSize: PAGE_SIZE,
    errorFallback: t("errorLoad"),
    fetchPage,
  });

  const visibleItems = useMemo(() => {
    const term = search.trim();
    if (!term) return items;
    return items.filter((item) => item.title.includes(term));
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setEvent(eventFilter === "all" ? "booking_completed" : eventFilter);
    setAwards(EMPTY_AWARDS);
    setRepeat("unlimited");
    setDailyCap("");
    setEffectiveFrom("");
    setEffectiveTo("");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: AdminPointRule) => {
    setEditing(row);
    setTitle(row.title);
    setDescription(row.description ?? "");
    setEvent(row.event);
    const draft: AwardsDraft = { ...EMPTY_AWARDS };
    for (const award of row.awards) {
      draft[award.subjectType] = String(award.points);
    }
    setAwards(draft);
    setRepeat(row.limits.repeat);
    setDailyCap(row.limits.dailyCap ? String(row.limits.dailyCap) : "");
    setEffectiveFrom(toLocalInputValue(row.effective.from));
    setEffectiveTo(toLocalInputValue(row.effective.to));
    setSaveError(null);
    setDrawerOpen(true);
  };

  const awardsList = useMemo(
    () =>
      SUBJECT_TYPES.flatMap((subjectType) => {
        const points = Number.parseInt(awards[subjectType], 10);
        return Number.isFinite(points) && points > 0
          ? [{ subjectType, points }]
          : [];
      }),
    [awards],
  );

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("rules.columns.title"),
          size: 190,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("event", {
          header: t("rules.columns.event"),
          size: 160,
          enableSorting: false,
          cell: (info) => t(`events.${info.getValue()}`),
        }),
        columnHelper.accessor("awards", {
          header: t("rules.columns.awards"),
          size: 220,
          enableSorting: false,
          cell: (info) => (
            <span className="text-sm">
              {info
                .getValue()
                .map(
                  (award) =>
                    `${t(`subjects.${award.subjectType}`)}: ${award.points}`,
                )
                .join(" · ")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.limits, {
          id: "limits",
          header: t("rules.columns.limits"),
          size: 170,
          enableSorting: false,
          cell: (info) => {
            const limits = info.getValue();
            const cap = limits.dailyCap
              ? ` · ${t("rules.dailyCapShort", { cap: limits.dailyCap })}`
              : "";
            return (
              <span className="text-sm">
                {t(`repeats.${limits.repeat}`)}
                {cap}
              </span>
            );
          },
        }),
        columnHelper.accessor("status", {
          header: t("rules.columns.status"),
          size: 100,
          enableSorting: false,
          cell: (info) => {
            const status = info.getValue();
            const color =
              status === "active"
                ? "success"
                : status === "inactive"
                  ? "warning"
                  : "danger";
            return (
              <Chip color={color} size="sm" variant="soft">
                {t(`statuses.${status}`)}
              </Chip>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("rules.columns.actions"),
          size: 160,
          cell: (info) => {
            const meta = info.table.options.meta as RuleTableMeta | undefined;
            if (!meta) return null;
            return (
              <div className={meta.actionsClassName}>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => meta.onEdit(info.row.original)}
                >
                  {t("actions.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => meta.onArchive(info.row.original)}
                >
                  {t("actions.archive")}
                </Button>
              </div>
            );
          },
        }),
      ] as ColumnDef<AdminPointRule, unknown>[],
    [t],
  );

  const meta: RuleTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: openEdit,
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const canSave = title.trim().length >= 2 && awardsList.length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const capValue = Number.parseInt(dailyCap, 10);
    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      event,
      awards: awardsList,
      limits: {
        repeat,
        dailyCap: Number.isFinite(capValue) && capValue > 0 ? capValue : undefined,
      },
      effective: {
        from: fromLocalInputValue(effectiveFrom),
        to: fromLocalInputValue(effectiveTo),
      },
    };
    try {
      if (editing) {
        await adminGamification.updatePointRule(editing.id, input);
      } else {
        await adminGamification.createPointRule(input);
      }
      setDrawerOpen(false);
      void reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminGamification.archivePointRule(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setArchivePending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{
        activeTabId: "rules",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("rules.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("rules.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["all", ...POINT_RULE_EVENTS] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setEventFilter(value)}
                selected={eventFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`events.${value}`)}
              </FilterChip>
            ))}
            <Button size="sm" variant="primary" onPress={openCreate}>
              {t("rules.actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("rules.title")}
          columns={columns}
          data={visibleItems}
          emptyLabel={t("rules.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          meta={meta}
          summaryLabel={t("infinite.summary", {
            loaded: visibleItems.length,
            total,
          })}
          onLoadMore={loadMore}
        />
      </div>

      <AdminFormDrawer
        className="max-w-2xl sm:max-w-2xl"
        isOpen={drawerOpen}
        title={
          editing ? t("rules.actions.editTitle") : t("rules.actions.createTitle")
        }
        onOpenChange={setDrawerOpen}
      >
        <div className={styles.form()}>
          <TextField
            className={styles.field()}
            fullWidth
            name="title"
            value={title}
            onChange={setTitle}
          >
            <Label>{t("rules.fields.title")}</Label>
            <Input placeholder={t("rules.fields.titleHint")} />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="description"
            value={description}
            onChange={setDescription}
          >
            <Label>{t("rules.fields.description")}</Label>
            <Input />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("rules.fields.event")}</Label>
            <div className={styles.chips()}>
              {POINT_RULE_EVENTS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={event === value ? "primary" : "secondary"}
                  onPress={() => setEvent(value)}
                >
                  {t(`events.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("rules.fields.awards")}</Label>
            <Typography className="text-xs text-muted">
              {t("rules.fields.awardsHint")}
            </Typography>
            <div className={styles.awardsGrid()}>
              {SUBJECT_TYPES.map((subjectType) => (
                <TextField
                  key={subjectType}
                  className={styles.field()}
                  fullWidth
                  name={`award-${subjectType}`}
                  value={awards[subjectType]}
                  onChange={(value) =>
                    setAwards((prev) => ({ ...prev, [subjectType]: value }))
                  }
                >
                  <Label>{t(`subjects.${subjectType}`)}</Label>
                  <Input inputMode="numeric" placeholder="—" />
                </TextField>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("rules.fields.repeat")}</Label>
            <div className={styles.chips()}>
              {POINT_RULE_REPEATS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={repeat === value ? "primary" : "secondary"}
                  onPress={() => setRepeat(value)}
                >
                  {t(`repeats.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            className={styles.field()}
            fullWidth
            name="dailyCap"
            value={dailyCap}
            onChange={setDailyCap}
          >
            <Label>{t("rules.fields.dailyCap")}</Label>
            <Input inputMode="numeric" placeholder={t("rules.fields.dailyCapHint")} />
          </TextField>

          <div className={styles.row()}>
            <TextField
              className={styles.field()}
              fullWidth
              name="effectiveFrom"
              value={effectiveFrom}
              onChange={setEffectiveFrom}
            >
              <Label>{t("rules.fields.effectiveFrom")}</Label>
              <Input dir="ltr" type="datetime-local" />
            </TextField>

            <TextField
              className={styles.field()}
              fullWidth
              name="effectiveTo"
              value={effectiveTo}
              onChange={setEffectiveTo}
            >
              <Label>{t("rules.fields.effectiveTo")}</Label>
              <Input dir="ltr" type="datetime-local" />
            </TextField>
          </div>

          {saveError ? (
            <p className="text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={saving || !canSave}
              variant="primary"
              onPress={() => void handleSave()}
            >
              {t("actions.save")}
            </Button>
            <Button
              isDisabled={saving}
              variant="secondary"
              onPress={() => setDrawerOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("rules.actions.archiveBody")}</p>
            {archiveError ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {archiveError}
              </p>
            ) : null}
          </>
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("actions.archive")}
        confirmVariant="danger"
        isOpen={Boolean(archiving)}
        isPending={archivePending}
        title={t("rules.actions.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
