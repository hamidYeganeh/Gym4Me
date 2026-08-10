import { tv } from "tailwind-variants";

export const onboardingAvatarSectionVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center gap-8 px-1",
    title:
      "text-balance text-center text-[1.55rem] font-bold leading-tight text-foreground",
    preview:
      "relative flex size-44 items-center justify-center overflow-hidden rounded-full bg-accent/15 text-accent",
    previewImage: "size-full object-cover",
    previewIcon: "size-20",
    actions: "flex w-full flex-col gap-3",
    uploadBtn:
      "min-h-14 w-full rounded-[1.35rem] text-base font-bold text-accent-foreground",
    uploadIcon: "ms-2 size-5",
    premadeBtn:
      "min-h-14 w-full rounded-[1.35rem] border-2 border-accent bg-accent/5 text-base font-bold text-accent",
    skip:
      "text-sm font-semibold text-danger outline-none data-[hovered=true]:opacity-80",
    uploading: "flex flex-col items-center gap-5 py-10",
    progress: "size-28 text-accent",
    track: "stroke-default",
    fill: "stroke-accent",
    uploadingTitle: "text-xl font-bold text-foreground",
    fileName: "text-sm text-muted",
    hiddenInput: "sr-only",
  },
});
