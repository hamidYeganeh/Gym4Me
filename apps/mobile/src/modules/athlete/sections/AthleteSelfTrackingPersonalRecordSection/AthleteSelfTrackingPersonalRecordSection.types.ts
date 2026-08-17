import type { PersonalRecord } from "@repo/api";

export type AthleteSelfTrackingPersonalRecordSectionProps = {
  recordType: string;
  recordValue: string;
  recordDate: string;
  pending?: boolean;
  personalRecords: PersonalRecord[];
  onRecordTypeChange: (value: string) => void;
  onRecordValueChange: (value: string) => void;
  onRecordDateChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  className?: string;
};
