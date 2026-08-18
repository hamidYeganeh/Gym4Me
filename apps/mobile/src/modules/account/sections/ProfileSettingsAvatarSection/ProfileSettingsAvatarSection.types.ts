export type ProfileSettingsAvatarSectionProps = {
  src: string | null;
  alt: string;
  isUploading: boolean;
  onPickFile: (file: File) => void;
  className?: string;
};
