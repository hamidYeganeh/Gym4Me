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
  /** Disable the primary CTA while a mutation is in flight. */
  isPending?: boolean;
  /** Extra disabled state for the primary CTA. */
  isSubmitDisabled?: boolean;
  /** Close the drawer after submit. Defaults to true. */
  closeOnSubmit?: boolean;
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
