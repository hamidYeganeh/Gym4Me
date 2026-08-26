export type AthleteSocialCreateScreenProps = {
  pending?: boolean;
  error?: boolean;
  onSubmit: (body: string, files: File[]) => void | Promise<void>;
  className?: string;
};
