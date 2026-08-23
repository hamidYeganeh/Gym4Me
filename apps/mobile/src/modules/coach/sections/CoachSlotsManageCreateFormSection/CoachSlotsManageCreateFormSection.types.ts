import type { CoachSlotClub } from "@repo/api";

export type CoachSlotsManageDayOption = {
  date: string;
  label: string;
};

export type CoachSlotsManageCreateFormSectionProps = {
  title: string;
  dayLabel: string;
  timeLabel: string;
  durationLabel: string;
  bufferBeforeLabel: string;
  bufferAfterLabel: string;
  travelBufferLabel: string;
  venueLabel: string;
  venueRemoteLabel: string;
  noClubsHint: string;
  createSlotLabel: string;
  days: CoachSlotsManageDayOption[];
  draftDate: string;
  draftTime: string;
  draftDuration: number;
  draftBufferBefore: number;
  draftBufferAfter: number;
  draftTravelBuffer: number;
  draftClubId: string | null;
  startTimes: readonly string[];
  durations: readonly number[];
  bufferOptions: readonly number[];
  clubs: CoachSlotClub[];
  error?: string | null;
  isCreating?: boolean;
  formatTime: (time: string) => string;
  formatDuration: (minutes: number) => string;
  onDraftDateChange: (date: string) => void;
  onDraftTimeChange: (time: string) => void;
  onDraftDurationChange: (minutes: number) => void;
  onDraftBufferBeforeChange: (minutes: number) => void;
  onDraftBufferAfterChange: (minutes: number) => void;
  onDraftTravelBufferChange: (minutes: number) => void;
  onDraftClubIdChange: (clubId: string | null) => void;
  onCreate: () => void | Promise<void>;
  className?: string;
};
