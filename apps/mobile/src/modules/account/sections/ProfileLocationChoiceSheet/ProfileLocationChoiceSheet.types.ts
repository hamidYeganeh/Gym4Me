export type ProfileLocationChoiceOption = {
  id: string;
  name: string;
};

export type ProfileLocationChoiceSheetProps = {
  title: string;
  options: readonly ProfileLocationChoiceOption[];
  value: string | null;
  emptyLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: ProfileLocationChoiceOption) => void;
};
