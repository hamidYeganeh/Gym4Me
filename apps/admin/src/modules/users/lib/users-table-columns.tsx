import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { PublicUser, Role } from "@repo/api";
import {
  formatAdminDate,
  kycChipColor,
  statusChipColor,
  userDisplayName,
} from "@/shared/lib/user-format";

export type UsersTableLabels = {
  columns: {
    name: string;
    phone: string;
    roles: string;
    status: string;
    kyc: string;
    createdAt: string;
    actions: string;
  };
  roles: (role: Role) => string;
  status: (status: PublicUser["status"]) => string;
  kyc: (status: PublicUser["kyc"]["status"]) => string;
  unnamed: string;
  view: string;
};

export type UsersTableMeta = {
  onView: (userId: string) => void;
  chipsClassName: string;
  actionsClassName: string;
};

const columnHelper = createColumnHelper<PublicUser>();

export function createUsersTableColumns(labels: UsersTableLabels) {
  return [
    columnHelper.accessor((row) => userDisplayName(row, labels.unnamed), {
      id: "name",
      header: labels.columns.name,
      size: 180,
      enableSorting: true,
      cell: (info) => (
        <span className="block truncate font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("phone", {
      header: labels.columns.phone,
      size: 150,
      enableSorting: true,
      cell: (info) => (
        <span className="block truncate tabular-nums" dir="ltr">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("roles", {
      header: labels.columns.roles,
      size: 160,
      enableSorting: false,
      cell: (info) => {
        const meta = info.table.options.meta as UsersTableMeta | undefined;
        return (
          <div className={meta?.chipsClassName}>
            {info.getValue().map((role) => (
              <Chip key={role} size="sm" variant="soft">
                {labels.roles(role)}
              </Chip>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: labels.columns.status,
      size: 110,
      enableSorting: true,
      cell: (info) => (
        <Chip color={statusChipColor(info.getValue())} size="sm" variant="soft">
          {labels.status(info.getValue())}
        </Chip>
      ),
    }),
    columnHelper.accessor((row) => row.kyc.status, {
      id: "kycStatus",
      header: labels.columns.kyc,
      size: 120,
      enableSorting: true,
      cell: (info) => (
        <Chip color={kycChipColor(info.getValue())} size="sm" variant="soft">
          {labels.kyc(info.getValue())}
        </Chip>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: labels.columns.createdAt,
      size: 120,
      enableSorting: true,
      cell: (info) => (
        <span className="block tabular-nums">{formatAdminDate(info.getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      size: 110,
      header: () => (
        <span className="block w-full text-end">{labels.columns.actions}</span>
      ),
      cell: (info) => {
        const meta = info.table.options.meta as UsersTableMeta | undefined;
        return (
          <div className={meta?.actionsClassName}>
            <Button
              size="sm"
              variant="tertiary"
              onPress={() => meta?.onView(info.row.original.id)}
            >
              {labels.view}
            </Button>
          </div>
        );
      },
    }),
  ];
}
