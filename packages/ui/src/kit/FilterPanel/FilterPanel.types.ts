import type { ReactNode } from "react";

export type FilterPanelProps = {
  /** Controlled open state. */
  isOpen: boolean;
  /** Called when open state should change (close, dismiss). */
  onOpenChange: (open: boolean) => void;
  /** Panel title (e.g. "Filter Coach Results"). */
  title: ReactNode;
  /** Short supporting copy under the title. */
  description?: ReactNode;
  /** Accessible label for the close control. */
  closeLabel?: string;
  /** Primary CTA label. Prefer including result count in the string. */
  submitLabel: ReactNode;
  /** Called when the primary CTA is pressed. */
  onSubmit?: () => void;
  /** Optional icon after the submit label. */
  submitIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export type FilterPanelSectionProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  /** Lay out children as a horizontal chip row. */
  chipRow?: boolean;
};
