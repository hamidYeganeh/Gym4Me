export type OwnerCheckInDeskScreenProps = {
  pending?: boolean;
  message?: string | null;
  error?: string | null;
  onSubmit: (code: string) => Promise<void> | void;
  className?: string;
};
