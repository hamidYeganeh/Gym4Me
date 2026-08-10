"use client";

import { Button, Drawer, Typography } from "@heroui/react";
import {
  ArrowRight,
  Camera1,
  HealthCross1,
  HeartEcg,
  InfoCircle,
  MapPin1,
} from "@repo/icons";
import type { DevicePermissionKind } from "@/shared/lib/device-permissions";
import { onboardingPermissionSheetVariants } from "./OnboardingPermissionSheet.styles";
import type { OnboardingPermissionSheetProps } from "./OnboardingPermissionSheet.types";

function PermissionGlyph({ kind }: { kind: DevicePermissionKind }) {
  switch (kind) {
    case "notifications":
      return <HealthCross1 size={22} />;
    case "location":
      return <MapPin1 size={22} />;
    case "camera":
      return <Camera1 size={22} />;
    case "health":
      return <HeartEcg size={22} />;
  }
}

export function OnboardingPermissionSheet({
  kind,
  isOpen,
  labels,
  isRequesting = false,
  onOpenChange,
  onContinue,
  onSkip,
}: OnboardingPermissionSheetProps) {
  const styles = onboardingPermissionSheetVariants();

  return (
    <Drawer.Backdrop
      isDismissable={false}
      isKeyboardDismissDisabled
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Drawer.Content placement="bottom">
        <Drawer.Dialog className={styles.dialog()}>
          <Drawer.Handle />
          <Drawer.Body className={styles.body()}>
            <div className={styles.header()}>
              <Typography className={styles.title()} type="h2" weight="bold">
                {labels.title}
              </Typography>
              <Typography className={styles.subtitle()}>
                {labels.subtitle}
              </Typography>
            </div>

            <div aria-hidden className={styles.stage()}>
              <div className={styles.phone()}>
                <div className={styles.phoneScreen()} />
                <div className={styles.phoneBezel()} />
                <div className={styles.phoneIsland()} />
              </div>

              <div className={styles.banner()}>
                <div className={styles.bannerTop()}>
                  <div className={styles.bannerIcon()}>
                    <PermissionGlyph kind={kind} />
                  </div>
                  <div className={styles.bannerCopy()}>
                    <div className={styles.bannerTitleRow()}>
                      <Typography
                        className={styles.bannerTitle()}
                        weight="semibold"
                      >
                        {labels.sampleTitle}
                      </Typography>
                      <div className={styles.bannerMeta()}>
                        <span className={styles.bannerTime()}>
                          {labels.sampleTime}
                        </span>
                        <span className={styles.bannerDot()} />
                      </div>
                    </div>
                    <Typography className={styles.bannerBody()}>
                      {labels.sampleBody}
                    </Typography>
                    <Typography className={styles.bannerAction()}>
                      {labels.sampleAction}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infoRow()}>
              <InfoCircle aria-hidden className={styles.infoIcon()} size={16} />
              <Typography className={styles.infoText()}>{labels.info}</Typography>
            </div>
          </Drawer.Body>

          <Drawer.Footer className={styles.footer()}>
            <Button
              className={styles.continue()}
              fullWidth
              isDisabled={isRequesting}
              size="lg"
              variant="primary"
              onPress={onContinue}
            >
              {labels.continue}
              <ArrowRight
                aria-hidden
                className={styles.continueIcon()}
                size={20}
              />
            </Button>
            <Button
              className={styles.skip()}
              isDisabled={isRequesting}
              size="sm"
              variant="ghost"
              onPress={onSkip}
            >
              {labels.skip}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
