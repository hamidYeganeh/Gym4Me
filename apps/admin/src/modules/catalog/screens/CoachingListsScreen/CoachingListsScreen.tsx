import { useCallback, useMemo } from "react";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import type {
  AdminCoachService,
  CoachStudent,
  Paginated,
  SessionPackage,
} from "@repo/api";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  AdminDataTable,
  AdminFilterSelect,
  AdminShell,
} from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import {
  adminListPaginationProps,
  adminListPaginationSummary,
} from "@/shared/lib/admin-list-pagination";
import { adminCoaching } from "@/shared/lib/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { coachingListsScreenVariants } from "./CoachingListsScreen.styles";
import type {
  CoachingListsScreenProps,
  CoachingView,
} from "./CoachingListsScreen.types";

const PAGE_SIZE = 30;
const FILTER_KEYS = ["view"] as const;
const VIEWS: CoachingView[] = ["services", "packages", "students"];

type CoachingListFilters = {
  view: CoachingView;
};

const FILTER_DEFAULTS: CoachingListFilters & {
  search: string;
  page: number;
  page_size: number;
} = {
  view: "services",
  search: "",
  page: 1,
  page_size: PAGE_SIZE,
};

const serviceHelper = createColumnHelper<AdminCoachService>();
const packageHelper = createColumnHelper<SessionPackage>();
const studentHelper = createColumnHelper<CoachStudent>();

type CoachingRow = AdminCoachService | SessionPackage | CoachStudent;

export function CoachingListsScreen({ className }: CoachingListsScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const tCommon = useTranslations("Admin.Common");
  const styles = coachingListsScreenVariants();
  const { filters, setFilter,
    page,
    pageSize,
    setPage,
  } =
    useAdminListQueryParams<CoachingListFilters>({
      filterKeys: FILTER_KEYS,
      defaults: FILTER_DEFAULTS,
    });
  const view = VIEWS.includes(filters.view) ? filters.view : "services";

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
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<CoachingRow>({
    queryKey: JSON.stringify({ view, pageSize }),
    page,
    pageSize,
    onPageChange: setPage,
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

  const summary = adminListPaginationSummary(page, pageSize, total);

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
          <div className={styles.filters()}>
            <AdminFilterSelect
              label={t("coaching.filters.view")}
              options={VIEWS.map((item) => ({
                value: item,
                label: t(`coaching.views.${item}`),
              }))}
              value={view}
              onChange={(value) =>
                setFilter(
                  "view",
                  (VIEWS.includes(value as CoachingView)
                    ? value
                    : "services") as CoachingView,
                )
              }
            />
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
          isLoading={loading}
          loadingLabel={t("loading")}
          pagination={adminListPaginationProps({
            page,
            totalPages,
            previousLabel: tCommon("pagination.previous"),
            nextLabel: tCommon("pagination.next"),
            onPageChange: changePage,
          })}
          summaryLabel={tCommon("pagination.summary", summary)}
        />
      </div>
    </AdminShell>
  );
}
