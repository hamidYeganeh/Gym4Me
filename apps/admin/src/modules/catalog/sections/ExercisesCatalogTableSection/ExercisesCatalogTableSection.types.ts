import type { Exercise } from "@repo/api";

export type ExercisesCatalogTableSectionProps = {
  items: Exercise[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
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
