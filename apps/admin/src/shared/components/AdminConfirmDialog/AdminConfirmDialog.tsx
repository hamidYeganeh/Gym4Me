import { AlertDialog, Button } from "@heroui/react";
import { adminConfirmDialogVariants } from "./AdminConfirmDialog.styles";
import type { AdminConfirmDialogProps } from "./AdminConfirmDialog.types";

export function AdminConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  body,
  cancelLabel,
  confirmLabel,
  confirmVariant = "danger",
  isPending = false,
  onConfirm,
}: AdminConfirmDialogProps) {
  const styles = adminConfirmDialogVariants();

  return (
    <AlertDialog>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className={styles.body()}>{body}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                {cancelLabel}
              </Button>
              <Button
                isPending={isPending}
                variant={confirmVariant}
                onPress={() => void onConfirm()}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
