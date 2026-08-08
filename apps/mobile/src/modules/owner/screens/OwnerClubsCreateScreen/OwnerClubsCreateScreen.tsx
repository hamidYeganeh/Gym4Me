"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, TextField, Typography } from "@heroui/react";
import type { Club, KycStatus } from "@repo/api";
import { ApiError } from "@repo/api";
import { ArrowRight } from "@repo/icons/ArrowRight";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { FormStepper, type FormStepperStep } from "@repo/ui/kit/FormStepper";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { Header } from "@repo/ui/layout/Header";
import { useTranslations } from "next-intl";
import { accountClubs, accountKyc, mediaApi } from "@/shared/lib/api";
import { ownerClubsCreateScreenVariants } from "./OwnerClubsCreateScreen.styles";
import type { OwnerClubsCreateScreenProps } from "./OwnerClubsCreateScreen.types";

type WizardStep = 0 | 1 | 2;

export function OwnerClubsCreateScreen({
  className,
}: OwnerClubsCreateScreenProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateScreenVariants();
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(0);
  const [club, setClub] = useState<Club | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    accountKyc
      .status()
      .then((status) => {
        if (!cancelled) setKycStatus(status.kycStatus);
      })
      .catch(() => {
        // Leave gating to the API: KYC_REQUIRED responses redirect to /owner/kyc.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const steps: FormStepperStep[] = useMemo(
    () => [
      { key: "identity", label: t("stepIdentity") },
      { key: "contact", label: t("stepContact") },
      { key: "review", label: t("stepReview") },
    ],
    [t],
  );

  const goNext = () => {
    setError(null);
    if (step === 0 && !name.trim()) {
      setError(t("errorNameRequired"));
      return;
    }
    setStep((prev) => (prev < 2 ? ((prev + 1) as WizardStep) : prev));
  };

  const goBack = () => {
    setError(null);
    if (step === 0) {
      router.back();
      return;
    }
    setStep((prev) => (prev > 0 ? ((prev - 1) as WizardStep) : prev));
  };

  const handleSaveDraft = async (event?: FormEvent) => {
    event?.preventDefault();
    setError(null);
    setNotice(null);
    if (!name.trim()) {
      setError(t("errorNameRequired"));
      setStep(0);
      return;
    }
    setIsPending(true);
    try {
      const payload = {
        identity: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
        contact: phone.trim()
          ? { phones: [{ number: phone.trim() }] }
          : undefined,
        location: address.trim() ? { address: address.trim() } : undefined,
      };
      const next = club
        ? await accountClubs.update(club.id, payload)
        : await accountClubs.create(payload);
      setClub(next);
      setNotice(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitReview = async (file: File | null) => {
    if (!file || !club) return;
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const uploaded = await mediaApi.upload(file);
      const next = await accountClubs.submit(club.id, {
        documentMediaIds: [uploaded.id],
      });
      setClub(next);
      setNotice(t("submitted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const kycGateVisible = kycStatus !== null && kycStatus !== "approved";

  const reviewRows = [
    { key: "name", label: t("name"), value: name.trim() },
    { key: "description", label: t("description"), value: description.trim() },
    { key: "phone", label: t("phone"), value: phone.trim() },
    { key: "address", label: t("address"), value: address.trim() },
  ];

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <Header
          className="border-b-0 bg-background"
          startContent={
            <Button
              aria-label={t("back")}
              isIconOnly
              onPress={() => router.back()}
              size="lg"
              variant="ghost"
            >
              <ChevronLeft className="text-foreground" size={22} />
            </Button>
          }
          title={t("title")}
        />
      }
    >
      <div className={styles.content()}>
        <div className={styles.intro()}>
          <Typography type="h3" weight="semibold">
            {t("title")}
          </Typography>
          <Typography color="muted" type="body">
            {t("subtitle")}
          </Typography>
        </div>

        {kycGateVisible ? (
          <section className={styles.stepCard()}>
            <div>
              <Typography
                className={styles.stepTitle()}
                type="h4"
                weight="bold"
              >
                {t("kycRequiredTitle")}
              </Typography>
              <Typography className={styles.stepHint()} type="body-sm">
                {kycStatus === "pending"
                  ? t("kycPendingHint")
                  : t("kycRequiredHint")}
              </Typography>
            </div>
            {kycStatus !== "pending" ? (
              <Button
                fullWidth
                size="lg"
                variant="primary"
                onPress={() => router.push("/owner/kyc")}
              >
                {t("kycRequiredCta")}
              </Button>
            ) : null}
          </section>
        ) : (
          <>
        <FormStepper
          activeIndex={step}
          aria-label={t("stepperLabel")}
          className={styles.stepper()}
          steps={steps}
        />

        {club ? (
          <div className={styles.status()} role="status">
            {club.review.status}
          </div>
        ) : null}

        {step === 0 ? (
          <section className={styles.stepCard()}>
            <div>
              <Typography
                className={styles.stepTitle()}
                type="h4"
                weight="bold"
              >
                {t("stepIdentity")}
              </Typography>
              <Typography className={styles.stepHint()} type="body-sm">
                {t("stepIdentityHint")}
              </Typography>
            </div>
            <div className={styles.form()}>
              <TextField
                className={styles.field()}
                fullWidth
                isRequired
                name="name"
                value={name}
                onChange={setName}
              >
                <Label>{t("name")}</Label>
                <Input placeholder={t("namePlaceholder")} />
              </TextField>
              <TextField
                className={styles.field()}
                fullWidth
                name="description"
                value={description}
                onChange={setDescription}
              >
                <Label>{t("description")}</Label>
                <Input placeholder={t("descriptionPlaceholder")} />
              </TextField>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className={styles.stepCard()}>
            <div>
              <Typography
                className={styles.stepTitle()}
                type="h4"
                weight="bold"
              >
                {t("stepContact")}
              </Typography>
              <Typography className={styles.stepHint()} type="body-sm">
                {t("stepContactHint")}
              </Typography>
            </div>
            <div className={styles.form()}>
              <TextField
                className={styles.field()}
                fullWidth
                name="phone"
                value={phone}
                onChange={setPhone}
              >
                <Label>{t("phone")}</Label>
                <Input placeholder={t("phonePlaceholder")} type="tel" />
              </TextField>
              <TextField
                className={styles.field()}
                fullWidth
                name="address"
                value={address}
                onChange={setAddress}
              >
                <Label>{t("address")}</Label>
                <Input placeholder={t("addressPlaceholder")} />
              </TextField>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className={styles.stepCard()}>
            <div>
              <Typography
                className={styles.stepTitle()}
                type="h4"
                weight="bold"
              >
                {t("stepReview")}
              </Typography>
              <Typography className={styles.stepHint()} type="body-sm">
                {t("stepReviewHint")}
              </Typography>
            </div>
            <div>
              {reviewRows.map((row) => (
                <div key={row.key}>
                  <div className={styles.reviewRow()}>
                    <span className={styles.reviewLabel()}>{row.label}</span>
                    <span className={styles.reviewValue()}>
                      {row.value || t("notProvided")}
                    </span>
                  </div>
                  <div aria-hidden className={styles.reviewDivider()} />
                </div>
              ))}
            </div>

            <Button
              fullWidth
              isPending={isPending}
              size="lg"
              variant="primary"
              onPress={() => void handleSaveDraft()}
            >
              {t("save")}
            </Button>

            {club ? (
              <div className={styles.upload()}>
                <Label>{t("submit")}</Label>
                <Typography className={styles.stepHint()} type="body-sm">
                  {t("uploadHint")}
                </Typography>
                <input
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className={styles.uploadInput()}
                  disabled={isSubmitting}
                  type="file"
                  onChange={(event) => {
                    void handleSubmitReview(event.target.files?.[0] ?? null);
                  }}
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {error ? (
          <p className={styles.error()} role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className={styles.notice()} role="status">
            {notice}
          </p>
        ) : null}

        {step < 2 ? (
          <div className={styles.navRow()}>
            <Button
              className={styles.navBack()}
              size="lg"
              variant="outline"
              onPress={goBack}
            >
              {t("prevStep")}
            </Button>
            <Button
              className={styles.navNext()}
              size="lg"
              variant="primary"
              onPress={goNext}
            >
              {t("nextStep")}
              <ArrowRight size={20} />
            </Button>
          </div>
        ) : (
          <div className={styles.navRow()}>
            <Button
              className={styles.navBack()}
              size="lg"
              variant="outline"
              onPress={goBack}
            >
              {t("prevStep")}
            </Button>
          </div>
        )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
