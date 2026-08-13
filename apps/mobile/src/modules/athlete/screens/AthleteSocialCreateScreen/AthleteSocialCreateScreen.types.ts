export type AthleteSocialCreateScreenProps = {
  pending?: boolean;
  error?: boolean;
  onSubmit: (body: string) => void | Promise<void>;
  className?: string;
};
