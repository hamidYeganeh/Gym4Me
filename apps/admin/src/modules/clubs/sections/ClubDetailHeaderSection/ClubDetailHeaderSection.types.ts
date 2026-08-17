import type { Club } from '@repo/api';

export type ClubDetailHeaderSectionProps = {
  club: Club | null;
  onBack: () => void;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  className?: string;
};
