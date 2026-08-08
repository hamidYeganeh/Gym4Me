import { createColumnHelper } from "@tanstack/react-table";
import { Button, Chip } from "@heroui/react";
import type { AdminKycRequest, KycRequestKind, KycRequestStatus } from "@repo/api";
import { formatAdminDate } from "@/shared/lib/user-format";

export type KycTableLabels = {
  columns: {
    user: string;
    kind: string;
    nationalId: string;
    status: string;
    createdAt: string;
    actions: string;
  };
  kind: (kind: KycRequestKind) => string;
  status: (status: KycRequestStatus) => string;
  review: string;
};

export type KycTableMeta = {
  onReview: (row: AdminKycRequest) => void;
  actionsClassName: string;
};

const columnHelper = createColumnHelper<AdminKycRequest>();

export function kycRequestId(row: AdminKycRequest) {
  return row.id ?? row._id ?? "";
}

export function kycUserLabel(row: AdminKycRequest) {
  const user = row.userId;
  if (typeof user === "string") return user;
  const name = [user.name?.first, user.name?.last].filter(Boolean).join(" ");
  return name || user.phone || user.code || user.id || "—";
}

export function kycUserId(row: AdminKycRequest): string | null {
  const user = row.userId;
  if (typeof user === "string") return user;
  return user.id ?? null;
}

export function createKycTableColumns(labels: KycTableLabels) {
  return [
    columnHelper.display({
      id: "user",
      header: labels.columns.user,
      size: 180,
      cell: (info) => (
        <span className="block truncate font-medium">
          {kycUserLabel(info.row.original)}
        </span>
      ),
    }),
    columnHelper.accessor("kind", {
      header: labels.columns.kind,
      size: 110,
      cell: (info) => labels.kind(info.getValue()),
    }),
    columnHelper.display({
      id: "nationalId",
      header: labels.columns.nationalId,
      size: 120,
      cell: (info) => (
        <span className="tabular-nums" dir="ltr">
          {info.row.original.nationalId ?? "—"}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: labels.columns.status,
      size: 110,
      cell: (info) => {
        const status = info.getValue();
        const color =
          status === "approved"
            ? "success"
            : status === "rejected"
              ? "danger"
              : "warning";
        return (
          <Chip color={color} size="sm" variant="soft">
            {labels.status(status)}
          </Chip>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: labels.columns.createdAt,
      size: 130,
      cell: (info) => formatAdminDate(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: labels.columns.actions,
      size: 120,
      cell: (info) => {
        const meta = info.table.options.meta as KycTableMeta | undefined;
        if (!meta) return null;
        return (
          <div className={meta.actionsClassName}>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => meta.onReview(info.row.original)}
            >
              {labels.review}
            </Button>
          </div>
        );
      },
    }),
  ];
}
