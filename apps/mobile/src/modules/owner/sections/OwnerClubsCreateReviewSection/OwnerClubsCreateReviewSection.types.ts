export type OwnerClubsCreateReviewField = {
  key: string;
  label: string;
  value: string;
};

export type OwnerClubsCreateReviewListItem = {
  key: string;
  primary: string;
  secondary?: string;
  meta?: string;
};

export type OwnerClubsCreateReviewMediaItem = {
  key: string;
  mediaId: string;
  fileName: string;
  label?: string;
};

export type OwnerClubsCreateReviewHourRow = {
  key: string;
  day: string;
  value: string;
};

export type OwnerClubsCreateReviewHourGroup = {
  key: string;
  title: string;
  rows: OwnerClubsCreateReviewHourRow[];
};

export type OwnerClubsCreateReviewSectionBlock = {
  key: string;
  title: string;
  fields?: OwnerClubsCreateReviewField[];
  chips?: string[];
  list?: OwnerClubsCreateReviewListItem[];
  media?: OwnerClubsCreateReviewMediaItem[];
  hourGroups?: OwnerClubsCreateReviewHourGroup[];
  emptyLabel?: string;
};

export type OwnerClubsCreateReviewSectionProps = {
  sections: OwnerClubsCreateReviewSectionBlock[];
  clubStatus: string | null;
  canSubmitDocuments: boolean;
  isPending: boolean;
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmitDocument: (file: File | null) => void;
  className?: string;
};
