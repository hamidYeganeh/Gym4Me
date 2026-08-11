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
  AchievementGrantMode,
  AchievementMetric,
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
import {
  ACHIEVEMENT_METRICS,
  GRANT_MODES,
  SUBJECT_TYPES,
} from "../../lib/gamification-constants";
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
  const styles = achievementsListScreenVariants();

  const [audienceFilter, setAudienceFilter] = useState<
    GamificationSubjectType | "all"
  >("all");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAchievement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [audience, setAudience] = useState<GamificationSubjectType[]>([
    "athlete",
  ]);
  const [bonusPoints, setBonusPoints] = useState("0");
  const [grantMode, setGrantMode] = useState<AchievementGrantMode>("automatic");
  const [metric, setMetric] = useState<AchievementMetric>("lifetime_points");
  const [threshold, setThreshold] = useState("1");
  const [order, setOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setIcon("");
    setAudience(audienceFilter === "all" ? ["athlete"] : [audienceFilter]);
    setBonusPoints("0");
    setGrantMode("automatic");
    setMetric("lifetime_points");
    setThreshold("1");
    setOrder("0");
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: AdminAchievement) => {
    setEditing(row);
    setTitle(row.title);
    setDescription(row.description ?? "");
    setIcon(row.icon ?? "");
    setAudience(row.audience);
    setBonusPoints(String(row.bonusPoints));
    setGrantMode(row.grant.mode);
    setMetric(row.grant.rule?.metric ?? "lifetime_points");
    setThreshold(String(row.grant.rule?.threshold ?? 1));
    setOrder(String(row.order));
    setSaveError(null);
    setDrawerOpen(true);
  };

  const openGrant = (row: AdminAchievement) => {
    setGranting(row);
    setGrantSubjectType(row.audience[0] ?? "athlete");
    setGrantSubjectId("");
    setGrantError(null);
    setGrantDone(false);
  };

  const toggleAudience = (value: GamificationSubjectType) => {
    setAudience((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
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
    onEdit: openEdit,
    onGrant: openGrant,
    onArchive: (row) => {
      setArchiving(row);
      setArchiveError(null);
    },
  };

  const canSave =
    title.trim().length >= 2 &&
    audience.length > 0 &&
    (grantMode === "manual" || Number.parseInt(threshold, 10) >= 1);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      audience,
      bonusPoints: Number.parseInt(bonusPoints, 10) || 0,
      grant:
        grantMode === "manual"
          ? { mode: "manual" as const }
          : {
              mode: "automatic" as const,
              rule: {
                metric,
                threshold: Number.parseInt(threshold, 10) || 1,
              },
            },
      order: Number.parseInt(order, 10) || 0,
    };
    try {
      if (editing) {
        await adminGamification.updateAchievement(editing.id, input);
      } else {
        await adminGamification.createAchievement(input);
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
            <Button size="sm" variant="primary" onPress={openCreate}>
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
        className="max-w-2xl sm:max-w-2xl"
        isOpen={drawerOpen}
        title={
          editing
            ? t("achievements.actions.editTitle")
            : t("achievements.actions.createTitle")
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
            <Label>{t("achievements.fields.title")}</Label>
            <Input placeholder={t("achievements.fields.titleHint")} />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="description"
            value={description}
            onChange={setDescription}
          >
            <Label>{t("achievements.fields.description")}</Label>
            <Input />
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            name="icon"
            value={icon}
            onChange={setIcon}
          >
            <Label>{t("achievements.fields.icon")}</Label>
            <Input dir="ltr" placeholder={t("achievements.fields.iconHint")} />
          </TextField>

          <div className={styles.field()}>
            <Label>{t("achievements.fields.audience")}</Label>
            <div className={styles.chips()}>
              {SUBJECT_TYPES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={audience.includes(value) ? "primary" : "secondary"}
                  onPress={() => toggleAudience(value)}
                >
                  {t(`subjects.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className={styles.field()}>
            <Label>{t("achievements.fields.grantMode")}</Label>
            <div className={styles.chips()}>
              {GRANT_MODES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={grantMode === value ? "primary" : "secondary"}
                  onPress={() => setGrantMode(value)}
                >
                  {t(`grantModes.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          {grantMode === "automatic" ? (
            <>
              <div className={styles.field()}>
                <Label>{t("achievements.fields.metric")}</Label>
                <div className={styles.chips()}>
                  {ACHIEVEMENT_METRICS.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={metric === value ? "primary" : "secondary"}
                      onPress={() => setMetric(value)}
                    >
                      {t(`metrics.${value}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <TextField
                className={styles.field()}
                fullWidth
                name="threshold"
                value={threshold}
                onChange={setThreshold}
              >
                <Label>{t("achievements.fields.threshold")}</Label>
                <Input inputMode="numeric" />
              </TextField>
            </>
          ) : null}

          <div className={styles.row()}>
            <TextField
              className={styles.field()}
              fullWidth
              name="bonusPoints"
              value={bonusPoints}
              onChange={setBonusPoints}
            >
              <Label>{t("achievements.fields.bonusPoints")}</Label>
              <Input inputMode="numeric" />
            </TextField>

            <TextField
              className={styles.field()}
              fullWidth
              name="order"
              value={order}
              onChange={setOrder}
            >
              <Label>{t("achievements.fields.order")}</Label>
              <Input inputMode="numeric" />
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
