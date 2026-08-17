export type ClubDetailConfirmDialogsSectionProps = {
  activateOpen: boolean;
  deactivateOpen: boolean;
  deleteOpen: boolean;
  pending: boolean;
  onActivateOpenChange: (open: boolean) => void;
  onDeactivateOpenChange: (open: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onActivateConfirm: () => void;
  onDeactivateConfirm: () => void;
  onDeleteConfirm: () => void;
};
