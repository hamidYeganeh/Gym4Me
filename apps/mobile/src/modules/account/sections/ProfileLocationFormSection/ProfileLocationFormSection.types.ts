import type { HTMLAttributes, ReactNode } from "react";
import type { FavouriteLocationKind } from "@repo/api";
import type { FavouriteLocationFormValues } from "@/modules/account/lib/profile-locations";

export type ProfileLocationKindOption = {
  id: FavouriteLocationKind;
  label: string;
  icon: ReactNode;
};

export type ProfileLocationFormSectionProps = HTMLAttributes<HTMLFormElement> & {
  values: FavouriteLocationFormValues;
  kinds: readonly ProfileLocationKindOption[];
  error: string | null;
  isPending: boolean;
  isDeleting: boolean;
  canDelete: boolean;
  onChange: (patch: Partial<FavouriteLocationFormValues>) => void;
  onSubmit: () => void;
  onDelete: () => void;
};
