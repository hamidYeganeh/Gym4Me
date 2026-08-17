export type UsersDetailConfirmDialogsSectionProps = {
  activateOpen: boolean;
  deactivateOpen: boolean;
  deleteOpen: boolean;
  actionPending: boolean;
  reason: string;
  onActivateOpenChange: (open: boolean) => void;
  onDeactivateOpenChange: (open: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onActivateConfirm: () => void;
  onDeactivateConfirm: () => void;
  onDeleteConfirm: () => void;
  onReasonChange: (value: string) => void;
};
