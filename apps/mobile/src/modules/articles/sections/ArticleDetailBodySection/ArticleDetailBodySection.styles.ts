import { tv } from "tailwind-variants";

export const articleDetailBodySectionVariants = tv({
  slots: {
    root: "flex flex-col gap-4",
    body: "flex flex-col gap-4 text-foreground/90 leading-8 [&_h2]:mt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:ps-5",
  },
});
