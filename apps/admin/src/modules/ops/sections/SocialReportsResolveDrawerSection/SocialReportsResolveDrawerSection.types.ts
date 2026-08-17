import type { SocialReport } from "@repo/api";

export type SocialReportsResolveDrawerSectionProps = {
  resolving: {
    report: SocialReport;
    resolution: "resolved" | "rejected";
  } | null;
  onOpenChange: (open: boolean) => void;
  note: string;
  onNoteChange: (value: string) => void;
  pending: boolean;
  actionError: string | null;
  onConfirm: () => void;
};
