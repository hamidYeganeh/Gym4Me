import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { ArrowLeft } from "@repo/icons/ArrowLeft";
import { Pencil1 } from "@repo/icons/Pencil1";
import { useTranslations } from "next-intl";
import { formatAdminDate } from "@/shared/lib/user-format";
import { ownerLabel } from "../../lib/clubs-data";
import { clubDetailHeaderSectionVariants } from "./ClubDetailHeaderSection.styles";
import type { ClubDetailHeaderSectionProps } from "./ClubDetailHeaderSection.types";

export function ClubDetailHeaderSection({
  club,
  onBack,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  className,
}: ClubDetailHeaderSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubDetailHeaderSectionVariants();

  return (
    <div className={styles.header({ className })}>
      <div>
        <Button className="mb-3" size="sm" variant="tertiary" onPress={onBack}>
          <ArrowLeft size={16} />
          {t("detail.back")}
        </Button>
        {club ? (
          <>
            <Typography className={styles.title()} type="h1" weight="bold">
              {club.identity.name}
            </Typography>
            <Typography className={styles.subtitle()}>
              {ownerLabel(club.ownerId)} · {formatAdminDate(club.createdAt)}
            </Typography>
          </>
        ) : (
          <Typography className={styles.title()} type="h1" weight="bold">
            {t("title")}
          </Typography>
        )}
      </div>

      {club ? (
        <div className={styles.actions()}>
          <Button variant="outline" onPress={onEdit}>
            <Pencil1 size={16} />
            {t("actions.edit")}
          </Button>
          {club.operationalStatus === "inactive" ? (
            <Button variant="primary" onPress={onActivate}>
              {t("actions.activate")}
            </Button>
          ) : (
            <Button variant="outline" onPress={onDeactivate}>
              {t("actions.deactivate")}
            </Button>
          )}
          <Button variant="danger" onPress={onDelete}>
            {t("actions.delete")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
