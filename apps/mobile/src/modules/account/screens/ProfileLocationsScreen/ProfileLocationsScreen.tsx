"use client";

import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { BarbellHorizontal } from "@repo/icons/BarbellHorizontal";
import { Briefcase1 } from "@repo/icons/Briefcase1";
import { House1 } from "@repo/icons/House1";
import { MapPin1 } from "@repo/icons/MapPin1";
import { Plus } from "@repo/icons/Plus";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import type { FavouriteLocationKind } from "@repo/api";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { favouriteLocationLine } from "@/modules/account/lib/profile-locations";
import { useProfileLocations } from "@/modules/account/lib/use-profile-locations";
import { ProfileLocationFormSection } from "../../sections/ProfileLocationFormSection";
import { ProfileLocationsListSection } from "../../sections/ProfileLocationsListSection";
import { profileLocationsScreenVariants } from "./ProfileLocationsScreen.styles";
import type { ProfileLocationsScreenProps } from "./ProfileLocationsScreen.types";
import { useRouter } from "@/shared/lib/app-router";

const ICON = 20;

export function ProfileLocationsScreen({
  className,
  roleSegment = "athlete",
}: ProfileLocationsScreenProps) {
  const t = useTranslations("Mobile.ProfileLocations");
  const styles = profileLocationsScreenVariants();
  const router = useRouter();
  const locations = useProfileLocations();

  const kindLabel = (kind: FavouriteLocationKind) => {
    if (kind === "home") return t("kindHome");
    if (kind === "work") return t("kindWork");
    if (kind === "gym") return t("kindGym");
    return t("kindOther");
  };

  const kindIcon = (kind: FavouriteLocationKind) => {
    if (kind === "home") return <House1 size={ICON} />;
    if (kind === "work") return <Briefcase1 size={ICON} />;
    if (kind === "gym") return <BarbellHorizontal size={ICON} />;
    return <MapPin1 size={ICON} />;
  };

  const kinds = useMemo(
    () =>
      [
        { id: "home" as const, label: t("kindHome"), icon: kindIcon("home") },
        { id: "work" as const, label: t("kindWork"), icon: kindIcon("work") },
        { id: "gym" as const, label: t("kindGym"), icon: kindIcon("gym") },
        { id: "other" as const, label: t("kindOther"), icon: kindIcon("other") },
      ] as const,
    [t],
  );

  const listItems = locations.items.map((item) => ({
    item,
    title: item.label?.trim() || kindLabel(item.kind),
    line: favouriteLocationLine(item),
    icon: kindIcon(item.kind),
  }));

  const isForm = locations.mode === "form";
  const title = isForm
    ? locations.editingId
      ? t("editTitle")
      : t("createTitle")
    : t("title");

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          endContent={
            isForm || locations.atLimit ? undefined : (
              <Button
                aria-label={t("addAria")}
                isIconOnly
                onPress={locations.openCreate}
                size="lg"
                variant="tertiary"
              >
                <Plus size={22} />
              </Button>
            )
          }
          onBack={() => {
            if (isForm) {
              locations.closeForm();
              return;
            }
            router.push(`/${roleSegment}/profile`);
          }}
          title={title}
        />
      }
    >
      <div className={styles.content()}>
        {isForm ? (
          <ProfileLocationFormSection
            canDelete={Boolean(locations.editingId)}
            error={locations.formError}
            isDeleting={locations.isDeleting}
            isPending={locations.isPending}
            kinds={kinds}
            onChange={locations.patchValues}
            onDelete={() => {
              void locations.remove();
            }}
            onSubmit={() => {
              void locations.save();
            }}
            values={locations.values}
          />
        ) : (
          <>
            <div className={styles.intro()}>
              <Typography className={styles.introTitle()} type="h4" weight="bold">
                {t("title")}
              </Typography>
              <Typography className={styles.introSubtitle()} type="body-sm">
                {t("subtitle")}
              </Typography>
            </div>
            <ProfileLocationsListSection
              emptyHint={t("emptyHint")}
              emptyLabel={t("empty")}
              error={locations.error}
              items={listItems}
              loading={locations.loading}
              onRetry={() => {
                void locations.load();
              }}
              onSelect={locations.openEdit}
              retryLabel={t("retry")}
            />
            {!locations.loading && !locations.error && !locations.atLimit ? (
              <Button
                className={styles.add()}
                fullWidth
                onPress={locations.openCreate}
                variant="primary"
              >
                {t("add")}
                <Plus size={18} />
              </Button>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}
