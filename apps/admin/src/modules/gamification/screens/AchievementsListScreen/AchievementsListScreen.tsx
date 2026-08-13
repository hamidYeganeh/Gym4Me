import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import type {
  AdminAchievement,
  GamificationSubjectType,
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
import { routes } from "@/shared/lib/routes";
import { SUBJECT_TYPES } from "../../lib/gamification-constants";
import { achievementsListScreenVariants } from "./AchievementsListScreen.styles";
import type { AchievementsListScreenProps } from "./AchievementsListScreen.types";

const PAGE_SIZE = 30;

const columnHelper = createColumnHelper<AdminAchievement>();

type AchievementTableMeta = {
  onEdit: (row: AdminAchievement) => void;
  onArchive: (row: AdminAchievement) => void;
  onGrant: (row: AdminAchievement) => void;
  actionsClassName: string;
};

export function AchievementsListScreen({
  className,
}: AchievementsListScreenProps) {
  const t = useTranslations("Admin.Gamification");
  const navigate = useNavigate();
  const styles = achievementsListScreenVariants();

  const [audienceFilter, setAudienceFilter] = useState<
    GamificationSubjectType | "all"
  >("all");
  const [search, setSearch] = useState("");

  const [archiving, setArchiving] = useState<AdminAchievement | null>(null);
  const [archivePending, setArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const [granting, setGranting] = useState<AdminAchievement | null>(null);
  const [grantSubjectType, setGrantSubjectType] =
    useState<GamificationSubjectType>("athlete");
  const [grantSubjectId, setGrantSubjectId] = useState("");
  const [grantPending, setGrantPending] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantDone, setGrantDone] = useState(false);

  const queryKey = useMemo(
    () => JSON.stringify({ audienceFilter, pageSize: PAGE_SIZE }),
    [audienceFilter],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminGamification.listAchievements({
        page,
        page_size: pageSize,
        audience: audienceFilter === "all" ? undefined : audienceFilter,
      });
    },
    [audienceFilter],
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
  } = useAdminInfiniteQuery<AdminAchievement>({
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

  const openGrant = (row: AdminAchievement) => {
    setGranting(row);
    setGrantSubjectType(row.audience[0] ?? "athlete");
    setGrantSubjectId("");
    setGrantError(null);
    setGrantDone(false);
  };

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("title", {
          header: t("achievements.columns.title"),
          size: 200,
          enableSorting: false,
          cell: (info) => (
            <span className="block truncate font-medium">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("audience", {
          header: t("achievements.columns.audience"),
          size: 160,
          enableSorting: false,
          cell: (info) => (
            <span>
              {info
                .getValue()
                .map((value) => t(`subjects.${value}`))
                .join("، ")}
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.grant, {
          id: "grant",
          header: t("achievements.columns.grant"),
          size: 190,
          enableSorting: false,
          cell: (info) => {
            const grant = info.getValue();
            if (grant.mode === "manual") {
              return (
                <Chip color="default" size="sm" variant="soft">
                  {t("grantModes.manual")}
                </Chip>
              );
            }
            return (
              <span className="text-sm">
                {grant.rule
                  ? `${t(`metrics.${grant.rule.metric}`)} ≥ ${grant.rule.threshold}`
                  : t("grantModes.automatic")}
              </span>
            );
          },
        }),
        columnHelper.accessor("bonusPoints", {
          header: t("achievements.columns.bonusPoints"),
          size: 90,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor((row) => row.grantsCount ?? 0, {
          id: "grantsCount",
          header: t("achievements.columns.grantsCount"),
          size: 90,
          enableSorting: false,
          cell: (info) => (
            <span className="tabular-nums">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor("status", {
          header: t("achievements.columns.status"),
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
          header: t("achievements.columns.actions"),
          size: 230,
          cell: (info) => {
            const meta = info.table.options.meta as
              | AchievementTableMeta
              | undefined;
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
                  variant="tertiary"
                  onPress={() => meta.onGrant(info.row.original)}
                >
                  {t("actions.grant")}
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
      ] as ColumnDef<AdminAchievement, unknown>[],
    [t],
  );

  const meta: AchievementTableMeta = {
    actionsClassName: styles.actions(),
    onEdit: (row) => navigate(routes.achievementEdit(row.id)),
    onGrant: openGrant,
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const handleArchive = async () => {
    if (!archiving) return;
    setArchivePending(true);
    setArchiveError(null);
    try {
      await adminGamification.archiveAchievement(archiving.id);
      setArchiving(null);
      void reload();
    } catch (err) {
      setArchiveError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setArchivePending(false);
    }
  };

  const handleGrant = async () => {
    if (!granting || !grantSubjectId.trim()) return;
    setGrantPending(true);
    setGrantError(null);
    setGrantDone(false);
    try {
      await adminGamification.grantAchievement(granting.id, {
        subjectType: grantSubjectType,
        subjectId: grantSubjectId.trim(),
      });
      setGrantDone(true);
      void reload();
    } catch (err) {
      setGrantError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setGrantPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="gamification"
      className={className}
      gamificationSection={{
        activeTabId: "achievements",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("achievements.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("achievements.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {(["all", ...SUBJECT_TYPES] as const).map((value) => (
              <FilterChip
                key={value}
                onPress={() => setAudienceFilter(value)}
                selected={audienceFilter === value}
              >
                {value === "all" ? t("filterAll") : t(`subjects.${value}`)}
              </FilterChip>
            ))}
            <Button
              size="sm"
              variant="primary"
              onPress={() => navigate(routes.achievementNew)}
            >
              {t("achievements.actions.create")}
            </Button>
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("achievements.title")}
          columns={columns}
          data={visibleItems}
          emptyLabel={t("achievements.empty")}
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
        className="max-w-xl sm:max-w-xl"
        isOpen={Boolean(granting)}
        title={t("achievements.actions.grantTitle", {
          title: granting?.title ?? "",
        })}
        onOpenChange={(open) => {
          if (!open) setGranting(null);
        }}
      >
        <div className={styles.form()}>
          <div className={styles.field()}>
            <Label>{t("achievements.fields.subjectType")}</Label>
            <div className={styles.chips()}>
              {(granting?.audience ?? SUBJECT_TYPES).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={grantSubjectType === value ? "primary" : "secondary"}
                  onPress={() => setGrantSubjectType(value)}
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
            value={grantSubjectId}
            onChange={setGrantSubjectId}
          >
            <Label>{t("achievements.fields.subjectId")}</Label>
            <Input dir="ltr" placeholder={t("achievements.fields.subjectIdHint")} />
          </TextField>

          {grantError ? (
            <p className="text-sm text-danger" role="alert">
              {grantError}
            </p>
          ) : null}
          {grantDone ? (
            <p className="text-sm text-success" role="status">
              {t("achievements.actions.grantDone")}
            </p>
          ) : null}

          <div className={styles.actions()}>
            <Button
              isDisabled={grantPending || !grantSubjectId.trim()}
              variant="primary"
              onPress={() => void handleGrant()}
            >
              {t("actions.grant")}
            </Button>
            <Button
              isDisabled={grantPending}
              variant="secondary"
              onPress={() => setGranting(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </AdminFormDrawer>

      <AdminConfirmDialog
        body={
          <>
            <p>{t("achievements.actions.archiveBody")}</p>
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
        title={t("achievements.actions.archiveTitle")}
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
      />
    </AdminShell>
  );
}
