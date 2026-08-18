"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Typography } from "@heroui/react/typography";
import { Apple } from "@repo/icons/Apple";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Fire1 } from "@repo/icons/Fire1";
import { Glucose } from "@repo/icons/Glucose";
import { HeartEcg } from "@repo/icons/HeartEcg";
import { Path1 } from "@repo/icons/Path1";
import { Ruler1 } from "@repo/icons/Ruler1";
import { WeightScale } from "@repo/icons/WeightScale";
import { Wind } from "@repo/icons/Wind";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { useUnitsSettings } from "@/modules/account/lib/use-units-settings";
import { unitIconKey } from "@/modules/account/lib/units-settings";
import { UnitsChoiceSheet } from "../../sections/UnitsChoiceSheet";
import { UnitsSettingsGeneralSection } from "../../sections/UnitsSettingsGeneralSection";
import { unitsSettingsScreenVariants } from "./UnitsSettingsScreen.styles";
import type { UnitsSettingsScreenProps } from "./UnitsSettingsScreen.types";

const ICON = 22;

export function UnitsSettingsScreen({
  className,
}: UnitsSettingsScreenProps) {
  const t = useTranslations("Mobile.UnitsSettings");
  const styles = unitsSettingsScreenVariants();
  const router = useRouter();
  const settings = useUnitsSettings();
  const icons = {
    distance: <Path1 size={ICON} />,
    speed: <Wind size={ICON} />,
    height: <Ruler1 size={ICON} />,
    weight: <WeightScale size={ICON} />,
    blood_pressure: <HeartEcg size={ICON} />,
    nutrition: <Apple size={ICON} />,
    calorie: <Fire1 size={ICON} />,
    glucose: <Glucose size={ICON} />,
  };
  const fallbackIcon = <Ruler1 size={ICON} />;
  const activeIconKey = settings.activeGroup
    ? unitIconKey(settings.activeGroup.value)
    : null;

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          appearance="bar"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="tertiary"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        {settings.error ? (
          <div className={styles.status()}>
            <Typography className={styles.empty()} type="body">
              {settings.error}
            </Typography>
            <Button
              className={styles.retry()}
              onPress={() => {
                void settings.load();
              }}
              variant="outline"
            >
              {t("retry")}
            </Button>
          </div>
        ) : settings.loading || settings.groups.length > 0 ? (
          <UnitsSettingsGeneralSection
            fallbackIcon={fallbackIcon}
            groups={settings.groups}
            icons={icons}
            isLoading={settings.loading}
            onSelect={settings.openGroup}
            units={settings.units}
          />
        ) : (
          <Typography className={styles.empty()} type="body">
            {t("empty")}
          </Typography>
        )}
      </div>

      <UnitsChoiceSheet
        error={settings.saveError}
        group={settings.activeGroup}
        icon={
          (activeIconKey ? icons[activeIconKey] : null) ?? fallbackIcon
        }
        isPending={settings.isPending}
        onApply={() => {
          void settings.apply();
        }}
        onChange={(next) => settings.setDraft(next)}
        onOpenChange={(open) => {
          if (!open) settings.closeSheet();
        }}
        value={settings.draft}
      />
    </AppLayout>
  );
}
