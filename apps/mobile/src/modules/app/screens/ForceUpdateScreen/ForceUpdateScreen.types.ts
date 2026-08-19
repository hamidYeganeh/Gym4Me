export type ForceUpdateScreenProps = {
  currentVersion: string;
  minimumVersion: string;
  updateUrl: string | null;
  title?: string | null;
  features?: string[];
  message?: string;
  className?: string;
};
