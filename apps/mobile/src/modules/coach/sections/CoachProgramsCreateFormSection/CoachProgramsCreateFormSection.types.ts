export type CoachProgramsCreateFormSectionProps = {
  title: string;
  focusLabel: string;
  creating?: boolean;
  createError?: string | null;
  onTitleChange: (value: string) => void;
  onFocusLabelChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  className?: string;
};
