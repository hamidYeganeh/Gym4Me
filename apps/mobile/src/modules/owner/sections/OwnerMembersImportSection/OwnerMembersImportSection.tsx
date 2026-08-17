import { Button, Typography } from "@heroui/react";
import { ownerMembersImportSectionVariants } from "./OwnerMembersImportSection.styles";
import type { OwnerMembersImportSectionProps } from "./OwnerMembersImportSection.types";

export function OwnerMembersImportSection({
  title,
  hint,
  summaryLabel,
  importErrorLabel,
  importDoneLabel,
  commitLabel,
  importRows,
  importSummary,
  importMessage,
  importPending,
  sellPlanId,
  validateImportFile,
  commitImport,
  className,
}: OwnerMembersImportSectionProps) {
  const styles = ownerMembersImportSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.body()}>
        <Typography type="body" weight="semibold">
          {title}
        </Typography>
        <Typography type="body-sm">{hint}</Typography>
        <input
          accept=".csv,text/csv"
          disabled={importPending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void validateImportFile(file, importErrorLabel);
          }}
          type="file"
        />
        {importSummary ? (
          <Typography type="body-sm">{summaryLabel(importSummary)}</Typography>
        ) : null}
        {importMessage ? (
          <Typography type="body-sm">{importMessage}</Typography>
        ) : null}
        <Button
          isDisabled={
            importPending ||
            importRows.length === 0 ||
            !sellPlanId ||
            Boolean(importSummary?.error)
          }
          isPending={importPending}
          onPress={() => void commitImport(importErrorLabel, importDoneLabel)}
          variant="secondary"
        >
          {commitLabel}
        </Button>
      </div>
    </section>
  );
}
