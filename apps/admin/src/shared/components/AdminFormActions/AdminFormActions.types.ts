export type AdminFormActionsProps = {
  cancelLabel: string;
  saveLabel: string;
  saveAndCreateNewLabel?: string;
  showSaveAndCreateNew?: boolean;
  isPending?: boolean;
  isDisabled?: boolean;
  onCancel?: () => void;
  className?: string;
};
