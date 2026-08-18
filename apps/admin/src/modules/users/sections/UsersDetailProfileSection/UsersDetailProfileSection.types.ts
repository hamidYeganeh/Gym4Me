import type { PublicUser } from "@repo/api";
import type { UsersProfileFormValues } from "../../components/UsersProfileForm";

export type UsersDetailProfileSectionProps = {
  user: PublicUser;
  defaultValues: UsersProfileFormValues;
  formId?: string;
  onSubmit: (values: UsersProfileFormValues) => Promise<void>;
  className?: string;
};
