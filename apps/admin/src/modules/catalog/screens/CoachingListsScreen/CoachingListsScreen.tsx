import { useCallback, useMemo, useState } from "react";
import { Button, Chip, Typography } from "@heroui/react";
import type {
  AdminCoachService,
  CoachStudent,
  Paginated,
  SessionPackage,
} from "@repo/api";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable, AdminShell } from "@/shared/components";
import { useAdminInfiniteQuery } from "@/shared/hooks";
import { adminCoaching } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { coachingListsScreenVariants } from "./CoachingListsScreen.styles";
import type {
  CoachingListsScreenProps,
  CoachingView,
} from "./CoachingListsScreen.types";

const PAGE_SIZE = 30;
const VIEWS: CoachingView[] = ["services", "packages", "students"];

const serviceHelper = createColumnHelper<AdminCoachService>();
const packageHelper = createColumnHelper<SessionPackage>();
const studentHelper = createColumnHelper<CoachStudent>();

type CoachingRow = AdminCoachService | SessionPackage | CoachStudent;

export function CoachingListsScreen({ className }: CoachingListsScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const styles = coachingListsScreenVariants();
  const [view, setView] = useState<CoachingView>("services");

  const fetchPage = useCallback(
    async (page: number, pageSize: number): Promise<Paginated<CoachingRow>> => {
      const query = { page, page_size: pageSize };
      if (view === "services") return adminCoaching.listServices(query);
      if (view === "packages") return adminCoaching.listPackages(query);
      return adminCoaching.listStudents(query);
    },
    [view],
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
  } = useAdminInfiniteQuery<CoachingRow>({
    queryKey: JSON.stringify({ view, pageSize: PAGE_SIZE }),
    pageSize: PAGE_SIZE,
    errorFallback: t("coaching.errorLoad"),
    fetchPage,
  });

  const serviceColumns = useMemo(
    () =>
      [
        serviceHelper.accessor("title", {
          header: t("coaching.serviceColumns.title"),
        }),
        serviceHelper.accessor("coachUserId", {
          header: t("coaching.serviceColumns.coach"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        serviceHelper.accessor("status", {
          header: t("coaching.serviceColumns.status"),
          cell: ({ getValue }) => (
            <Chip size="sm" variant="soft">
              <Chip.Label>{String(getValue())}</Chip.Label>
            </Chip>
          ),
        }),
        serviceHelper.accessor("createdAt", {
          header: t("coaching.serviceColumns.createdAt"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
      ] as ColumnDef<AdminCoachService, unknown>[],
    [t],
  );

  const packageColumns = useMemo(
    () =>
      [
        packageHelper.accessor("coachUserId", {
          header: t("coaching.packageColumns.coach"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        packageHelper.accessor("athleteUserId", {
          header: t("coaching.packageColumns.athlete"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        packageHelper.accessor(
          (row) => `${row.sessions.used}/${row.sessions.total}`,
          {
            id: "sessions",
            header: t("coaching.packageColumns.sessions"),
          },
        ),
        packageHelper.accessor("status", {
          header: t("coaching.packageColumns.status"),
          cell: ({ getValue }) => (
            <Chip size="sm" variant="soft">
              <Chip.Label>{String(getValue())}</Chip.Label>
            </Chip>
          ),
        }),
      ] as ColumnDef<SessionPackage, unknown>[],
    [t],
  );

  const studentColumns = useMemo(
    () =>
      [
        studentHelper.accessor("coachUserId", {
          header: t("coaching.studentColumns.coach"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        studentHelper.accessor("athleteUserId", {
          header: t("coaching.studentColumns.athlete"),
          cell: ({ getValue }) => (
            <span className="block max-w-44 truncate" dir="ltr">
              {getValue()}
            </span>
          ),
        }),
        studentHelper.accessor("createdAt", {
          header: t("coaching.studentColumns.since"),
          cell: ({ getValue }) => formatAdminDate(getValue()),
        }),
        studentHelper.accessor("status", {
          header: t("coaching.studentColumns.status"),
          cell: ({ getValue }) => (
            <Chip size="sm" variant="soft">
              <Chip.Label>{String(getValue())}</Chip.Label>
            </Chip>
          ),
        }),
      ] as ColumnDef<CoachStudent, unknown>[],
    [t],
  );

  const columns = (
    view === "services"
      ? serviceColumns
      : view === "packages"
        ? packageColumns
        : studentColumns
  ) as ColumnDef<CoachingRow, unknown>[];

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{ activeTabId: "coaching" }}
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("coaching.title")}
          </Typography>
          <Typography className={styles.subtitle()}>
            {t("coaching.subtitle")}
          </Typography>
          <div className={styles.actions()}>
            {VIEWS.map((item) => (
              <FilterChip
                key={item}
                onPress={() => setView(item)}
                selected={view === item}
              >
                {t(`coaching.views.${item}`)}
              </FilterChip>
            ))}
            <Button size="sm" variant="ghost" onPress={() => void reload()}>
              {t("refresh")}
            </Button>
          </div>
        </section>

        <AdminDataTable
          ariaLabel={t("coaching.title")}
          columns={columns}
          data={items}
          emptyLabel={t("coaching.empty")}
          error={error}
          getRowId={(row) => row.id}
          hasMore={hasMore}
          isFetchingMore={fetchingMore}
          isLoading={loading}
          loadingLabel={t("loading")}
          loadingMoreLabel={t("loadingMore")}
          onLoadMore={loadMore}
          summaryLabel={t("coaching.summary", {
            loaded: items.length,
            total,
          })}
        />
      </div>
    </AdminShell>
  );
}
