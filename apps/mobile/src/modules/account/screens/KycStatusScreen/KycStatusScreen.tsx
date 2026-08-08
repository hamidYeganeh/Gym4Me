"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, TextField } from "@heroui/react";
import type { KycStatusResponse } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { accountKyc } from "@/shared/lib/api";
import {
  isoToJalaliDisplay,
  jalaliDisplayToIso,
} from "@/shared/lib/jalali";
import { useAuth } from "@/shared/providers/AuthProvider";
import { kycStatusScreenVariants } from "./KycStatusScreen.styles";
import type { KycStatusScreenProps } from "./KycStatusScreen.types";

export function KycStatusScreen({
  className,
  roleSegment = "athlete",
}: KycStatusScreenProps) {
  const t = useTranslations("Mobile.Kyc");
  const styles = kycStatusScreenVariants();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [nationalId, setNationalId] = useState(user?.nationalId ?? "");
  const [birthDateJalali, setBirthDateJalali] = useState(
    isoToJalaliDisplay(user?.demographics.birthDate),
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const load = useCallback(async () => {
    const next = await accountKyc.status();
    setStatus(next);
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setError(t("error"));
    });
  }, [load, t]);

  const statusLabel = (value: string | undefined) => {
    switch (value) {
      case "pending":
        return t("statusPending");
      case "approved":
        return t("statusApproved");
      case "rejected":
        return t("statusRejected");
      default:
        return t("statusNone");
    }
  };

  const handleIdentity = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const iso = jalaliDisplayToIso(birthDateJalali);
    if (!/^\d{10}$/.test(nationalId.trim()) || !iso) {
      setError(t("error"));
      return;
    }
    setIsPending(true);
    try {
      const next = await accountKyc.submitIdentity({
        nationalId: nationalId.trim(),
        birthDate: iso,
      });
      setStatus(next);
      setNotice(t("submitted"));
      if (user) {
        refreshUser({
          ...user,
          nationalId: nationalId.trim(),
          kyc: {
            status: next.kycStatus,
            verifiedAt: next.kycVerifiedAt,
          },
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  };

  const handleDocument = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setNotice(null);
    setIsUploading(true);
    try {
      const next = await accountKyc.submitDocument("national_card", file);
      setStatus(next);
      setNotice(t("submitted"));
      if (user) {
        refreshUser({
          ...user,
          kyc: {
            status: next.kycStatus,
            verifiedAt: next.kycVerifiedAt,
          },
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmitIdentity =
    status?.kycStatus !== "approved" &&
    status?.identity.status !== "pending";

  return (
    <main className={styles.root({ className })}>
      <header className={styles.header()}>
        <h1 className={styles.title()}>{t("title")}</h1>
        <p className={styles.subtitle()}>{t("subtitle")}</p>
      </header>

      <div className={styles.statusCard()}>
        {t("status")}: {statusLabel(status?.kycStatus)}
      </div>

      {canSubmitIdentity ? (
        <form className={styles.form()} onSubmit={handleIdentity}>
          <TextField
            className={styles.field()}
            fullWidth
            name="nationalId"
            value={nationalId}
            onChange={setNationalId}
          >
            <Label>{t("nationalId")}</Label>
            <Input inputMode="numeric" maxLength={10} />
          </TextField>
          <TextField
            className={styles.field()}
            fullWidth
            name="birthDate"
            value={birthDateJalali}
            onChange={setBirthDateJalali}
          >
            <Label>{t("birthDate")}</Label>
            <Input placeholder="۱۳۷۰/۰۱/۰۱" />
          </TextField>
          <Button
            fullWidth
            isPending={isPending}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("submitIdentity")}
          </Button>
        </form>
      ) : null}

      <div className={styles.actions()}>
        <Label>{t("uploadDoc")}</Label>
        <input
          accept="image/jpeg,image/png,image/webp,application/pdf"
          type="file"
          onChange={(event) => {
            void handleDocument(event.target.files?.[0] ?? null);
          }}
        />
        {isUploading ? <p className={styles.subtitle()}>…</p> : null}
      </div>

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

      <Button
        size="lg"
        variant="ghost"
        onPress={() => router.push(`/${roleSegment}/profile`)}
      >
        {t("back")}
      </Button>
    </main>
  );
}
