import type { UseOwnerMembersScreenReturn } from "@/modules/owner/lib/use-owner-members-screen";

export type OwnerMembersImportSectionProps = Pick<
  UseOwnerMembersScreenReturn,
  | "importRows"
  | "importSummary"
  | "importMessage"
  | "importPending"
  | "sellPlanId"
  | "validateImportFile"
  | "commitImport"
> & {
  title: string;
  hint: string;
  summaryLabel: (values: {
    valid: number;
    imported: number;
    skipped: number;
    error: number;
  }) => string;
  importErrorLabel: string;
  importDoneLabel: string;
  commitLabel: string;
  className?: string;
};
