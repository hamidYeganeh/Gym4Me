export type ExitAppSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStay: () => void;
  onLeave: () => void;
};
