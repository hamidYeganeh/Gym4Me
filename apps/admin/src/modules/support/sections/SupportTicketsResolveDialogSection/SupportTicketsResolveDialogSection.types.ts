export type SupportTicketsResolveDialogSectionProps = {
  isOpen: boolean;
  resolveNote: string;
  onResolveNoteChange: (value: string) => void;
  actionPending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};
