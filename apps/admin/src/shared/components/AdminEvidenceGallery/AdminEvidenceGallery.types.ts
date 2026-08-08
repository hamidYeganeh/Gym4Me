export type AdminEvidenceGalleryProps = {
  label: string;
  emptyLabel: string;
  mediaIds?: string[];
  openDocumentLabel?: string;
  onOpenDocument?: () => void;
  documentPending?: boolean;
  className?: string;
};
