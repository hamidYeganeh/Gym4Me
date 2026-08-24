export type ImageCropperRequest = {
  file: File;
  aspect?: number;
};

export type ImageCropperSheetProps = {
  request: ImageCropperRequest | null;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};
