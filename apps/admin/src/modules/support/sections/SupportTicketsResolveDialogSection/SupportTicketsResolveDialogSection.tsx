import { Label } from "@heroui/react/label";
import { TextArea } from "@heroui/react/textarea";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { AdminConfirmDialog } from "@/shared/components";
import { supportTicketsResolveDialogSectionVariants } from "./SupportTicketsResolveDialogSection.styles";
import type { SupportTicketsResolveDialogSectionProps } from "./SupportTicketsResolveDialogSection.types";

export function SupportTicketsResolveDialogSection({
  isOpen,
  resolveNote,
  onResolveNoteChange,
  actionPending,
  onConfirm,
  onOpenChange,
}: SupportTicketsResolveDialogSectionProps) {
  const t = useTranslations("Admin.Support");
  const styles = supportTicketsResolveDialogSectionVariants();

  return (
    <AdminConfirmDialog
      body={
        <>
          <Typography>{t("resolveBody")}</Typography>
          <TextField
            className={styles.resolveField()}
            fullWidth
            name="resolutionNote"
            value={resolveNote}
            onChange={onResolveNoteChange}
          >
            <Label>{t("resolutionNote")}</Label>
            <TextArea className="min-h-20" />
          </TextField>
        </>
      }
      cancelLabel={t("cancel")}
      confirmLabel={t("resolve")}
      confirmVariant="primary"
      isOpen={isOpen}
      isPending={actionPending}
      title={t("resolveTitle")}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  );
}
