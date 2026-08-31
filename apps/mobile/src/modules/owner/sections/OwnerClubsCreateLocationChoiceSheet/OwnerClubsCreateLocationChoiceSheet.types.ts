export type OwnerClubsCreateLocationChoiceOption = {
  id: string;
  name: string;
};

export type OwnerClubsCreateLocationChoiceSheetProps = {
  title: string;
  options: readonly OwnerClubsCreateLocationChoiceOption[];
  value: string | null;
  emptyLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: OwnerClubsCreateLocationChoiceOption) => void;
};
