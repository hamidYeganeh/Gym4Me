import { tv } from "tailwind-variants";

export const onboardingAvatarSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-8 px-1",
    title:
      "text-balance text-center text-[1.55rem] font-bold leading-tight text-foreground",
    preview: "relative flex items-center justify-center overflow-hidden bg-accent/15 text-accent",
    previewImage: "size-full object-cover",
    previewIcon: "size-20",
    actions: "flex w-full flex-col gap-3",
    uploadBtn: "w-full text-base font-bold text-accent-foreground",
    uploadIcon: "ms-2",
    uploading: "flex flex-col items-center gap-5",
    progress: "size-28 text-accent",
    track: "stroke-default",
    fill: "stroke-accent",
    uploadingTitle: "text-xl font-bold text-foreground",
    fileName: "text-sm text-muted",
    hiddenInput: "sr-only",
  },
});
