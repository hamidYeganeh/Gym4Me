import { useMemo } from "react";
import type { PublicUser } from "@repo/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { AdminDataTable } from "@/shared/components";
import {
  createUsersTableColumns,
  type UsersTableMeta,
} from "../../lib/users-table-columns";
import { usersListTableSectionVariants } from "./UsersListTableSection.styles";
import type { UsersListTableSectionProps } from "./UsersListTableSection.types";

export function UsersListTableSection({
  items,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  error,
  onPageChange,
  sort,
  onSortChange,
  onView,
  toolbar,
  className,
}: UsersListTableSectionProps) {
  const t = useTranslations("Admin.Users");
  const commonT = useTranslations("Admin.Common");
  const styles = usersListTableSectionVariants();

  const columns = useMemo(
    () =>
      createUsersTableColumns({
        columns: {
          name: t("columns.name"),
          phone: t("columns.phone"),
          roles: t("columns.roles"),
          status: t("columns.status"),
          kyc: t("columns.kyc"),
          createdAt: t("columns.createdAt"),
          actions: t("columns.actions"),
        },
        roles: (value) => t(`roles.${value}`),
        status: (value) => t(`status.${value}`),
        kyc: (value) => t(`kyc.${value}`),
        unnamed: t("detail.unnamed"),
        view: t("actions.view"),
      }) as ColumnDef<PublicUser, unknown>[],
    [t],
  );

  const tableMeta = useMemo<UsersTableMeta>(
    () => ({
      onView,
      chipsClassName: styles.chips(),
      actionsClassName: styles.actionsCell(),
    }),
    // styles slots are stable class strings from tv()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onView],
  );

  return (
    <AdminDataTable<PublicUser>
      ariaLabel={t("title")}
      className={className}
      columns={columns}
      data={items}
      emptyLabel={t("empty")}
      error={error}
      getRowId={(row) => row.id}
      isLoading={loading}
      loadingLabel={t("loading")}
      loadingMoreLabel={t("loadingMore")}
      meta={tableMeta}
      pagination={{
        page,
        totalPages,
        previousLabel: commonT("pagination.previous"),
        nextLabel: commonT("pagination.next"),
        onPageChange,
      }}
      sort={sort}
      summaryLabel={commonT("pagination.summary", {
        from: total === 0 ? 0 : (page - 1) * pageSize + 1,
        to: Math.min(page * pageSize, total),
        total,
      })}
      toolbar={toolbar}
      onSortChange={onSortChange}
    />
  );
}
