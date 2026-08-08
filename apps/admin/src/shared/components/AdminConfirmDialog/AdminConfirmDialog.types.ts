import type { ReactNode } from "react";

export type AdminConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary" | "secondary";
  isPending?: boolean;
  onConfirm: () => void | Promise<void>;
  className?: string;
};
