import type { Exercise } from "@repo/api";

export type ExercisesCatalogTableSectionProps = {
  items: Exercise[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEdit: (row: Exercise) => void;
  onApprove: (row: Exercise) => void;
  onReject: (row: Exercise) => void;
  onArchive: (row: Exercise) => void;
  className?: string;
};

export type ExerciseTableMeta = {
  actionsClassName: string;
  onEdit: (row: Exercise) => void;
  onApprove: (row: Exercise) => void;
  onReject: (row: Exercise) => void;
  onArchive: (row: Exercise) => void;
};
