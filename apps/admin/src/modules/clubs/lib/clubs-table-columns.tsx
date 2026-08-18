import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import type { Club, ClubLifecycleStatus, ClubOperationalStatus } from "@repo/api";
import { formatAdminDate } from "@/shared/lib/user-format";
import { categoryLabel, ownerLabel } from "./clubs-data";

export type ClubsTableLabels = {
  columns: {
    name: string;
    owner: string;
    categories: string;
    lifecycle: string;
    operational: string;
    reviews: string;
    createdAt: string;
    actions: string;
  };
  lifecycle: (status: ClubLifecycleStatus) => string;
  operational: (status: ClubOperationalStatus) => string;
  view: string;
};

export type ClubsTableMeta = {
  onView: (clubId: string) => void;
  chipsClassName: string;
  actionsClassName: string;
};

const columnHelper = createColumnHelper<Club>();

function lifecycleColor(
  status: ClubLifecycleStatus,
): "success" | "danger" | "warning" | "accent" {
  if (status === "approved") return "success";
  if (status === "rejected" || status === "suspended") return "danger";
  if (status === "pending_review") return "warning";
  return "accent";
}

export function createClubsTableColumns(labels: ClubsTableLabels) {
  return [
    columnHelper.accessor((row) => row.identity.name, {
      id: "name",
      header: labels.columns.name,
      size: 200,
      enableSorting: true,
      cell: (info) => (
        <span className="block truncate font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("ownerId", {
      header: labels.columns.owner,
      size: 160,
      enableSorting: true,
      cell: (info) => (
        <span className="block truncate text-sm text-muted">
          {ownerLabel(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.categories, {
      id: "categories",
      header: labels.columns.categories,
      size: 140,
      enableSorting: false,
      cell: (info) => {
        const meta = info.table.options.meta as ClubsTableMeta | undefined;
        const cats = info.getValue();
        if (!cats.length) return "—";
        return (
          <div className={meta?.chipsClassName}>
            {cats.slice(0, 2).map((c) => (
              <Chip key={c.id} size="sm" variant="soft">
                {c.name ?? categoryLabel(c.id)}
              </Chip>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.review.status, {
      id: "lifecycleStatus",
      header: labels.columns.lifecycle,
      size: 120,
      enableSorting: true,
      cell: (info) => (
        <Chip color={lifecycleColor(info.getValue())} size="sm" variant="soft">
          {labels.lifecycle(info.getValue())}
        </Chip>
      ),
    }),
    columnHelper.accessor("operationalStatus", {
      header: labels.columns.operational,
      size: 100,
      enableSorting: true,
      cell: (info) => (
        <Chip
          color={info.getValue() === "active" ? "success" : "danger"}
          size="sm"
          variant="soft"
        >
          {labels.operational(info.getValue())}
        </Chip>
      ),
    }),
    columnHelper.accessor((row) => row.reviewsSummary, {
      id: "rating",
      header: labels.columns.reviews,
      size: 90,
      enableSorting: true,
      cell: (info) => {
        const summary = info.getValue();
        if (!summary.count) return "—";
        return (
          <span className="tabular-nums">
            {summary.average.toFixed(1)} ({summary.count})
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: labels.columns.createdAt,
      size: 120,
      enableSorting: true,
      cell: (info) => formatAdminDate(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: labels.columns.actions,
      size: 100,
      cell: (info) => {
        const meta = info.table.options.meta as ClubsTableMeta | undefined;
        return (
          <div className={meta?.actionsClassName}>
            <Button
              size="sm"
              variant="secondary"
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
