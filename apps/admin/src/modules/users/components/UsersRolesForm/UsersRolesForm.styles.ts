import { tv } from "tailwind-variants";

export const usersRolesFormVariants = tv({
  slots: {
    form: "flex flex-col gap-4",
    formError: "text-sm text-danger",
  },
});
