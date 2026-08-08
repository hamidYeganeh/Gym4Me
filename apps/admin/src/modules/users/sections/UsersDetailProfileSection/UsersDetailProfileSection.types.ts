import type { UsersProfileFormValues } from "../../components/UsersProfileForm";

export type UsersDetailProfileSectionProps = {
  defaultValues: UsersProfileFormValues;
  onSubmit: (values: UsersProfileFormValues) => Promise<void>;
  className?: string;
};
