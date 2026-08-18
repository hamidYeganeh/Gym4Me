import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import { UsersProfileForm } from "../../components/UsersProfileForm";
import { usersDetailProfileSectionVariants } from "./UsersDetailProfileSection.styles";
import type { UsersDetailProfileSectionProps } from "./UsersDetailProfileSection.types";

export function UsersDetailProfileSection({
  user,
  defaultValues,
  formId,
  onSubmit,
  className,
}: UsersDetailProfileSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersDetailProfileSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <aside className={styles.aside()}>
        <Typography className={styles.title()} weight="bold">
          {t("detail.personalInfo")}
        </Typography>
        <Typography className={styles.description()}>
          {t("detail.personalInfoHint")}
        </Typography>
      </aside>
      <div className={styles.card()}>
        <UsersProfileForm
          defaultValues={defaultValues}
          formId={formId}
          phone={user.phone}
          user={user}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}
