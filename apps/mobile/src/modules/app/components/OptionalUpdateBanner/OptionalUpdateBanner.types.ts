export type OptionalUpdateBannerProps = {
  title: string;
  body: string;
  features: string[];
  updateUrl: string | null;
  onUpdate: () => void;
  onDismiss: () => void;
  className?: string;
};
