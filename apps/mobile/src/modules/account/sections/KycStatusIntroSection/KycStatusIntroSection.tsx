import { Button, Link, Typography } from "@heroui/react";
import { Check, CheckCircle, ChevronLeft } from "@repo/icons";
import Image from "next/image";
import { kycStatusIntroSectionVariants } from "./KycStatusIntroSection.styles";
import type { KycStatusIntroSectionProps } from "./KycStatusIntroSection.types";

export function KycStatusIntroSection({
  title,
  subtitle,
  figureSrc,
  tips,
  error,
  readyLabel,
  skipLabel,
  onReady,
  onSkip,
  onBack,
  backLabel,
}: KycStatusIntroSectionProps) {
  const styles = kycStatusIntroSectionVariants();

  return (
    <>
      <div className={styles.topBar()}>
        <Button
          aria-label={backLabel}
          className={styles.backButton()}
          isIconOnly
          size="lg"
          type="button"
          variant="ghost"
          onPress={onBack}
        >
          <ChevronLeft size={22} />
        </Button>
      </div>

      <header className={styles.header()}>
        <Typography className={styles.title()} type="h1" weight="bold">
          {title}
        </Typography>
        <Typography className={styles.subtitle()} color="muted">
          {subtitle}
        </Typography>
      </header>

      <div className={styles.figure()}>
        <Image
          alt=""
          className={styles.figureImage()}
          height={240}
          src={figureSrc}
          width={240}
        />
      </div>

      <ul className={styles.tips()}>
        {tips.map((tip) => (
          <li className={styles.tip()} key={tip}>
            <CheckCircle className={styles.tipIcon()} size={22} />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      {error ? (
        <Typography className={styles.error()} role="alert" type="body-sm">
          {error}
        </Typography>
      ) : null}

      <div className={styles.spacer()} aria-hidden />

      <div className={styles.actions()}>
        <Button
          className={styles.primary()}
          fullWidth
          size="lg"
          variant="primary"
          onPress={onReady}
        >
          {readyLabel}
          <Check className={styles.primaryIcon()} size={20} />
        </Button>
        <Link className={styles.skip()} onPress={onSkip}>
          {skipLabel}
        </Link>
      </div>
    </>
  );
}
