import { tv } from "tailwind-variants";

export const articleRichTextEditorVariants = tv({
  slots: {
    root: "overflow-hidden rounded-xl border border-border bg-background [&_.tox-tinymce]:border-0!",
  },
});
