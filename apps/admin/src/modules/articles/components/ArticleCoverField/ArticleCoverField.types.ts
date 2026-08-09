export type ArticleCoverFieldProps = {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (mediaId: string | null) => void;
  disabled?: boolean;
  fileName?: string | null;
  uploaderTitle: string;
  uploaderDescription: string;
  uploaderButtonLabel: string;
  successMessage: string;
  errorMessage: string;
  retryLabel: string;
  removeLabel: string;
};
