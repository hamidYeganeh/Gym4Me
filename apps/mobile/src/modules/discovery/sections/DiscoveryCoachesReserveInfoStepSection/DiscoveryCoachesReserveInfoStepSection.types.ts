export type DiscoveryCoachesReserveInfoStepSectionProps = {
  fullName: string;
  onFullNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  conditionKeys: string[];
  onConditionKeysChange: (keys: string[]) => void;
  supplementKeys: string[];
  onSupplementKeysChange: (keys: string[]) => void;
};
