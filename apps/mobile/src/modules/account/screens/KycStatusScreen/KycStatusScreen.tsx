"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Link, TextField, Typography } from "@heroui/react";
import type { KycStatusResponse } from "@repo/api";
import { ApiError } from "@repo/api";
import {
  ArrowRight,
  Check,
  CheckCircle,
  ChevronLeft,
  Hourglass1,
  Scan1,
  ShieldCheck,
} from "@repo/icons";
import { Logo } from "@repo/ui/common/Logo";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { accountKyc } from "@/shared/lib/api";
import {
  isoToJalaliDisplay,
  jalaliDisplayToIso,
} from "@/shared/lib/jalali";
import { useAuth } from "@/shared/providers/AuthProvider";
import { kycStatusScreenVariants } from "./KycStatusScreen.styles";
import type {
  KycFlowStep,
  KycStatusScreenProps,
} from "./KycStatusScreen.types";

const KYC_FIGURE_SRC = "/auth/kyc-id.png";
const PROCESSING_TICK_MS = 900;

export function KycStatusScreen({
  className,
  roleSegment = "athlete",
}: KycStatusScreenProps) {
  const t = useTranslations("Mobile.Kyc");
  const styles = kycStatusScreenVariants();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<KycFlowStep>("intro");
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [nationalId, setNationalId] = useState(user?.nationalId ?? "");
  const [birthDateJalali, setBirthDateJalali] = useState(
    isoToJalaliDisplay(user?.demographics.birthDate),
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const profilePath = `/${roleSegment}/profile`;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const load = useCallback(async () => {
    const next = await accountKyc.status();
    setStatus(next);
    if (next.kycStatus === "approved") {
      setStep("success");
    } else if (next.kycStatus === "pending") {
      setStep("pending");
    } else if (
      next.kycStatus === "rejected" ||
      next.identity.status === "rejected"
    ) {
      setStep("rejected");
    } else {
      setStep("intro");
    }
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setError(t("error"));
    });
  }, [load, t]);

  useEffect(() => {
    if (step !== "scan") {
      stopCamera();
      return;
    }

    let cancelled = false;
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
      }
    };
    void start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step, stopCamera]);

  useEffect(() => {
    if (step !== "processing") return;
    setProcessingIndex(0);
    const timer = window.setInterval(() => {
      setProcessingIndex((current) => Math.min(current + 1, 2));
    }, PROCESSING_TICK_MS);
    return () => window.clearInterval(timer);
  }, [step]);

  const syncUser = (next: KycStatusResponse) => {
    setStatus(next);
    if (!user) return;
    refreshUser({
      ...user,
      nationalId: nationalId.trim() || user.nationalId,
      kyc: {
        status: next.kycStatus,
        verifiedAt: next.kycVerifiedAt,
      },
    });
  };

  const goBack = () => {
    setError(null);
    if (step === "details") {
      setStep("intro");
      return;
    }
    if (step === "scan") {
      setStep("details");
      return;
    }
    router.push(profilePath);
  };

  const handleDetails = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const iso = jalaliDisplayToIso(birthDateJalali);
    if (!/^\d{10}$/.test(nationalId.trim()) || !iso) {
      setError(t("errorDetails"));
      return;
    }
    setStep("scan");
  };

  const submitCapturedFile = async (file: File) => {
    setError(null);
    setStep("processing");
    setIsPending(true);
    stopCamera();

    const iso = jalaliDisplayToIso(birthDateJalali);
    if (!iso) {
      setError(t("errorDetails"));
      setStep("details");
      setIsPending(false);
      return;
    }

    try {
      // Prefer identity (Shahkar) first; document is supporting evidence.
      let next = await accountKyc.submitIdentity({
        nationalId: nationalId.trim(),
        birthDate: iso,
      });
      try {
        next = await accountKyc.submitDocument("national_card", file);
      } catch {
        // Document upload is best-effort if identity already decided status.
      }
      syncUser(next);
      if (next.kycStatus === "approved") {
        setStep("success");
      } else if (next.kycStatus === "pending") {
        setStep("pending");
      } else {
        setStep("rejected");
        setError(next.identity.rejectionReason ?? t("errorRejected"));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
      setStep("details");
    } finally {
      setIsPending(false);
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video || !cameraReady) {
      fileInputRef.current?.click();
      return;
    }
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      fileInputRef.current?.click();
      return;
    }
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) {
      fileInputRef.current?.click();
      return;
    }
    await submitCapturedFile(
      new File([blob], "national-card.jpg", { type: "image/jpeg" }),
    );
  };

  const tips = [
    t("tips.clear"),
    t("tips.blur"),
    t("tips.edges"),
  ] as const;

  const processingLabels = [
    t("processing.photo"),
    t("processing.identity"),
    t("processing.submit"),
  ] as const;

  if (step === "scan") {
    return (
      <main className={styles.scanRoot({ className })}>
        {cameraReady ? (
          <video
            ref={videoRef}
            autoPlay
            className={styles.scanVideo()}
            muted
            playsInline
          />
        ) : (
          <div aria-hidden className={styles.scanFallback()} />
        )}
        <div aria-hidden className={styles.scanGrid()} />

        <Button
          aria-label={t("back")}
          className={styles.scanBack()}
          isIconOnly
          size="lg"
          type="button"
          variant="ghost"
          onPress={goBack}
        >
          <ChevronLeft size={22} />
        </Button>

        <div className={styles.scanFrameWrap()}>
          <div className={styles.scanTooltip()}>
            <Hourglass1 size={16} />
            <span>{t("scan.holdStill")}</span>
          </div>
          <div aria-hidden className={styles.scanFrame()} />
        </div>

        <div className={styles.scanFooter()}>
          {!cameraReady ? (
            <p className={styles.scanHint()}>{t("scan.cameraFallback")}</p>
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

  if (step === "processing") {
    return (
      <main className={styles.processingRoot({ className })}>
        <div className={styles.processingSteps()}>
          {processingLabels.map((label, index) => (
            <p
              className={`${styles.processingStep()} ${
                index === processingIndex
                  ? styles.processingStepActive()
                  : styles.processingStepIdle()
              }`}
              key={label}
            >
              {label}
            </p>
          ))}
        </div>
        <div aria-hidden className={styles.processingGlow()} />
        <div className={styles.processingMark()}>
          <Logo gradient={false} shadow size="3xl" />
        </div>
      </main>
    );
  }

  if (step === "success" || step === "pending") {
    const isSuccess = step === "success";
    return (
      <main className={styles.root({ className })}>
        <section className={styles.panel()}>
          <div className={styles.successBody()}>
            <ShieldCheck
              className={styles.successIcon()}
              size={88}
            />
            <Typography className={styles.successTitle()} type="h1" weight="bold">
              {isSuccess ? t("success.title") : t("pending.title")}
            </Typography>
            <Typography className={styles.successSubtitle()} color="muted">
              {isSuccess ? t("success.subtitle") : t("pending.subtitle")}
            </Typography>
          </div>
          <div className={styles.actions()}>
            <Button
              className={styles.primary()}
              fullWidth
              size="lg"
              variant="primary"
              onPress={() => router.push(profilePath)}
            >
              {t("continue")}
              <ArrowRight className={styles.primaryIcon()} size={20} />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.root({ className })}>
      <section className={styles.panel()}>
        <div className={styles.topBar()}>
          <Button
            aria-label={t("back")}
            className={styles.backButton()}
            isIconOnly
            size="lg"
            type="button"
            variant="ghost"
            onPress={goBack}
          >
            <ChevronLeft size={22} />
          </Button>
        </div>

        {step === "intro" || step === "rejected" ? (
          <>
            <header className={styles.header()}>
              <Typography className={styles.title()} type="h1" weight="bold">
                {t("intro.title")}
              </Typography>
              <Typography className={styles.subtitle()} color="muted">
                {t("intro.subtitle")}
              </Typography>
            </header>

            <div className={styles.figure()}>
              <Image
                alt=""
                className={styles.figureImage()}
                height={240}
                src={KYC_FIGURE_SRC}
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

            {step === "rejected" && (error || status?.identity.rejectionReason) ? (
              <p className={styles.error()} role="alert">
                {error ?? status?.identity.rejectionReason}
              </p>
            ) : null}

            <div className={styles.spacer()} aria-hidden />

            <div className={styles.actions()}>
              <Button
                className={styles.primary()}
                fullWidth
                size="lg"
                variant="primary"
                onPress={() => {
                  setError(null);
                  setStep("details");
                }}
              >
                {t("intro.ready")}
                <Check className={styles.primaryIcon()} size={20} />
              </Button>
              <Link
                className={styles.skip()}
                onPress={() => router.push(profilePath)}
              >
                {t("intro.skip")}
              </Link>
            </div>
          </>
        ) : null}

        {step === "details" ? (
          <>
            <header className={styles.header()}>
              <Typography className={styles.title()} type="h1" weight="bold">
                {t("details.title")}
              </Typography>
              <Typography className={styles.subtitle()} color="muted">
                {t("details.subtitle")}
              </Typography>
            </header>

            <form className={styles.form()} onSubmit={handleDetails}>
              <TextField
                className={styles.field()}
                fullWidth
                isRequired
                name="nationalId"
                value={nationalId}
                onChange={setNationalId}
              >
                <Label className={styles.label()}>{t("nationalId")}</Label>
                <Input
                  className={styles.input()}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder={t("nationalIdPlaceholder")}
                />
              </TextField>
              <TextField
                className={styles.field()}
                fullWidth
                isRequired
                name="birthDate"
                value={birthDateJalali}
                onChange={setBirthDateJalali}
              >
                <Label className={styles.label()}>{t("birthDate")}</Label>
                <Input
                  className={styles.input()}
                  placeholder={t("birthDatePlaceholder")}
                />
              </TextField>

              {error ? (
                <p className={styles.error()} role="alert">
                  {error}
                </p>
              ) : null}

              <div className={styles.spacer()} aria-hidden />

              <div className={styles.actions()}>
                <Button
                  className={styles.primary()}
                  fullWidth
                  isPending={isPending}
                  size="lg"
                  type="submit"
                  variant="primary"
                >
                  {t("details.continue")}
                  <ArrowRight className={styles.primaryIcon()} size={20} />
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </section>
    </main>
  );
}
