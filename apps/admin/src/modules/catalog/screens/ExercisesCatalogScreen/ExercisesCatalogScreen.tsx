import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminShell } from "@/shared/components";
import {
  useAdminListQueryParams,
  useAdminPaginatedQuery,
} from "@/shared/hooks";
import { adminProgress } from "@/shared/lib/api";
import { routes } from "@/shared/lib/routes";
import { ExercisesCatalogHeaderSection } from "../../sections/ExercisesCatalogHeaderSection";
import { ExercisesCatalogModalsSection } from "../../sections/ExercisesCatalogModalsSection";
import { ExercisesCatalogTableSection } from "../../sections/ExercisesCatalogTableSection";
import { exercisesCatalogScreenVariants } from "./ExercisesCatalogScreen.styles";
import type { ExercisesCatalogScreenProps } from "./ExercisesCatalogScreen.types";

const PAGE_SIZE = 30;

export function ExercisesCatalogScreen({
  className,
}: ExercisesCatalogScreenProps) {
  const t = useTranslations("Admin.Catalog");
  const navigate = useNavigate();
  const styles = exercisesCatalogScreenVariants();

  const [search, setSearch] = useState("");
  const [rejecting, setRejecting] = useState<Exercise | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [archiving, setArchiving] = useState<Exercise | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { page, pageSize, setPage } = useAdminListQueryParams<Record<never, never>>({
    filterKeys: [],
    defaults: { page: 1, page_size: PAGE_SIZE },
  });

  const queryKey = useMemo(
    () => JSON.stringify({ search, pageSize }),
    [pageSize, search],
  );

  const fetchPage = useCallback(
    async (page: number, pageSize: number) => {
      return adminProgress.listExercises({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
      });
    },
    [search],
  );

  const {
    items,
    total,
    totalPages,
    loading,
    error,
    setPage: changePage,
    reload,
  } = useAdminPaginatedQuery<Exercise>({
    queryKey,
    page,
    pageSize,
    onPageChange: setPage,
    errorFallback: t("exercises.errorLoad"),
    fetchPage,
  });

  const runAction = async (action: () => Promise<unknown>) => {
    setActionPending(true);
    setActionError(null);
    try {
      await action();
      setRejecting(null);
      setArchiving(null);
      void reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t("actionError"),
      );
    } finally {
      setActionPending(false);
    }
  };

  return (
    <AdminShell
      activeNavId="catalogs"
      className={className}
      catalogSection={{
        activeTabId: "exercises",
        searchValue: search,
        onSearchChange: setSearch,
      }}
    >
      <div className={styles.content()}>
        <ExercisesCatalogHeaderSection
          onCreate={() => navigate(routes.catalogExerciseNew)}
          onRefresh={() => void reload()}
        />

        <ExercisesCatalogTableSection
          error={error}
          items={items}
          loading={loading}
          total={total}
          onApprove={(row) => {
            void runAction(() =>
              adminProgress.verifyExercise(row.id, { status: "approved" }),
            );
          }}
          onArchive={(row) => {
            setArchiving(row);
            setActionError(null);
          }}
          onEdit={(row) => navigate(routes.catalogExerciseEdit(row.id))}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={changePage}
          onReject={(row) => {
            setRejecting(row);
            setRejectionReason("");
            setActionError(null);
          }}
        />
      </div>

      <ExercisesCatalogModalsSection
        actionError={actionError}
        actionPending={actionPending}
        archiving={archiving}
        rejectionReason={rejectionReason}
        rejecting={rejecting}
        onArchiveConfirm={() => {
          if (!archiving) return;
          void runAction(() => adminProgress.archiveExercise(archiving.id));
        }}
        onArchivingOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
        onRejectConfirm={() => {
          if (!rejecting) return;
          void runAction(() =>
            adminProgress.verifyExercise(rejecting.id, {
              status: "rejected",
              rejectionReason: rejectionReason.trim(),
            }),
          );
        }}
        onRejectingOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
        onRejectionReasonChange={setRejectionReason}
      />
    </AdminShell>
  );
}
