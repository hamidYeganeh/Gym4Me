import { Card } from "@heroui/react";
import { useTranslations } from "next-intl";
import { UsersProfileForm } from "../../components/UsersProfileForm";
import { usersDetailProfileSectionVariants } from "./UsersDetailProfileSection.styles";
import type { UsersDetailProfileSectionProps } from "./UsersDetailProfileSection.types";

export function UsersDetailProfileSection({
  defaultValues,
  onSubmit,
  className,
}: UsersDetailProfileSectionProps) {
  const t = useTranslations("Admin.Users");
  const styles = usersDetailProfileSectionVariants();

  return (
    <Card className={styles.card({ className })}>
      <Card.Header>
        <Card.Title>{t("detail.title")}</Card.Title>
        <Card.Description>{t("subtitle")}</Card.Description>
      </Card.Header>
      <Card.Content>
        <UsersProfileForm defaultValues={defaultValues} onSubmit={onSubmit} />
      </Card.Content>
    </Card>
  );
}
