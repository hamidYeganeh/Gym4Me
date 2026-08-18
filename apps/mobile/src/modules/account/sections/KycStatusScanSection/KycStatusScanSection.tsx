import { Button } from "@heroui/react/button";
import { Link } from "@heroui/react/link";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Hourglass1 } from "@repo/icons/Hourglass1";
import { Scan1 } from "@repo/icons/Scan1";
import { kycStatusScanSectionVariants } from "./KycStatusScanSection.styles";
import type { KycStatusScanSectionProps } from "./KycStatusScanSection.types";

export function KycStatusScanSection({
  t,
  videoRef,
  fileInputRef,
  cameraReady,
  goBack,
  captureFromCamera,
  submitCapturedFile,
  className,
}: KycStatusScanSectionProps) {
  const styles = kycStatusScanSectionVariants();

  return (
    <main className={styles.root({ className })}>
      {cameraReady ? (
        <video
          ref={videoRef}
          autoPlay
          className={styles.video()}
          muted
          playsInline
        />
      ) : (
        <div aria-hidden className={styles.fallback()} />
      )}
      <div aria-hidden className={styles.grid()} />

      <Button
        aria-label={t("back")}
        className={styles.back()}
        isIconOnly
        size="lg"
        type="button"
        variant="ghost"
        onPress={goBack}
      >
        <ChevronLeft size={22} />
      </Button>

      <div className={styles.frameWrap()}>
        <div className={styles.tooltip()}>
          <Hourglass1 size={16} />
          <span>{t("scan.holdStill")}</span>
        </div>
        <div aria-hidden className={styles.frame()} />
      </div>

      <div className={styles.footer()}>
        {!cameraReady ? (
          <Typography className={styles.hint()} type="body-sm">
            {t("scan.cameraFallback")}
          </Typography>
        ) : null}
        <Button
          aria-label={t("scan.capture")}
          className={styles.captureButton()}
          isIconOnly
          size="lg"
          type="button"
          onPress={() => void captureFromCamera()}
        >
          <Scan1 size={32} />
        </Button>
        <Link
          className={styles.pickFile()}
          onPress={() => fileInputRef.current?.click()}
        >
          {t("scan.pickFile")}
        </Link>
        <input
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput()}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void submitCapturedFile(file);
          }}
        />
      </div>
    </main>
  );
}
