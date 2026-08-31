"use client";

import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Typography } from "@heroui/react/typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { exitAppSheetVariants } from "./ExitAppSheet.styles";
import type { ExitAppSheetProps } from "./ExitAppSheet.types";

const EXIT_IMAGE_SRC = "/exit/treadmill.png";

export function ExitAppSheet({
  isOpen,
  onOpenChange,
  onStay,
  onLeave,
}: ExitAppSheetProps) {
  const t = useTranslations("ExitApp");
  const styles = exitAppSheetVariants();

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="bottom">
        <Drawer.Dialog className={styles.dialog()}>
          <Drawer.Handle />
          <Drawer.Body className={styles.body()}>
            <div className={styles.figure()}>
              <Image
                alt={t("imageAlt")}
                className={styles.image()}
                fill
                priority
                sizes="288px"
                src={EXIT_IMAGE_SRC}
              />
            </div>
            <div className={styles.copy()}>
              <Typography className={styles.title()} type="h2" weight="bold">
                {t("title")}
              </Typography>
              <Typography className={styles.subtitle()}>{t("body")}</Typography>
            </div>
          </Drawer.Body>
          <Drawer.Footer className={styles.footer()}>
            <Button
              className={styles.stay()}
              fullWidth
              size="lg"
              variant="primary"
              onPress={onStay}
            >
              {t("stay")}
            </Button>
            <Button
              className={styles.leave()}
              size="lg"
              variant="ghost"
              onPress={onLeave}
            >
              {t("leave")}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
