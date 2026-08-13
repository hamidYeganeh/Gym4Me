import { tv } from "tailwind-variants";

export const metricTypesEditScreenVariants = tv({
  slots: {
    content: "w-full",
    status: "flex justify-center py-16",
    error: "text-sm text-danger",
  },
});
