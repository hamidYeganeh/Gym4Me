import { Button } from "@heroui/react";
import { adminFormActionsVariants } from "./AdminFormActions.styles";
import type { AdminFormActionsProps } from "./AdminFormActions.types";

export function AdminFormActions({
  cancelLabel,
  saveLabel,
  saveAndCreateNewLabel,
  showSaveAndCreateNew = false,
  isPending = false,
  isDisabled = false,
  onCancel,
  className,
}: AdminFormActionsProps) {
  const styles = adminFormActionsVariants();

  return (
    <div className={styles.root({ className })}>
      {onCancel ? (
        <Button type="button" variant="tertiary" onPress={onCancel}>
          {cancelLabel}
        </Button>
      ) : null}
      {showSaveAndCreateNew && saveAndCreateNewLabel ? (
        <Button
          isDisabled={isDisabled}
          isPending={isPending}
          name="intent"
          type="submit"
          value="saveAndCreateNew"
          variant="secondary"
        >
          {saveAndCreateNewLabel}
        </Button>
      ) : null}
      <Button
        isDisabled={isDisabled}
        isPending={isPending}
        name="intent"
        type="submit"
        value="save"
        variant="primary"
      >
        {saveLabel}
      </Button>
    </div>
  );
}
