"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { Role, RoleRequest } from "@repo/api";
import { ApiError } from "@repo/api";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { Note1 } from "@repo/icons/Note1";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { accountRoles, mediaApi } from "@/shared/lib/api";
import { roleRequestWizardScreenVariants } from "./RoleRequestWizardScreen.styles";
import type { RoleRequestWizardScreenProps } from "./RoleRequestWizardScreen.types";

const FIELD_ICON = 18;

export function RoleRequestWizardScreen({
  className,
  role,
  roleSegment = "athlete",
}: RoleRequestWizardScreenProps) {
  const t = useTranslations("Mobile.RoleApply");
  const styles = roleRequestWizardScreenVariants();
  const router = useRouter();
  const [request, setRequest] = useState<RoleRequest | null>(null);
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [years, setYears] = useState("");
  const [note, setNote] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isCoach = role === "coach";
  const title = isCoach ? t("wizardCoachTitle") : t("wizardOwnerTitle");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await accountRoles.apply({ role });
        const overview = await accountRoles.list();
        if (cancelled) return;
        const action = overview.actions.find((item) => item.role === role);
        const next = action?.request ?? null;
        setRequest(next);
        if (next) {
          setBio(next.application.bio ?? "");
          setHeadline(next.application.headline ?? "");
          setYears(
            next.application.yearsExperience != null
              ? String(next.application.yearsExperience)
              : "",
          );
          setNote(next.application.note ?? "");
          setDocumentId(next.application.documentMediaIds[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : t("error"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, t]);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await mediaApi.upload(file);
      setDocumentId(uploaded.id);
      setNotice(t("documentUploaded"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!documentId) {
      setError(t("documentRequired"));
      return;
    }
    setIsPending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await accountRoles.submit(role as Role, {
        bio: bio.trim() || undefined,
        headline: isCoach ? headline.trim() || undefined : undefined,
        yearsExperience:
          isCoach && years.trim() ? Number(years) : undefined,
        documentMediaIds: [documentId],
        note: note.trim() || undefined,
      });
      setRequest(result.request);
      setNotice(t("submitted"));
      router.replace(`/${roleSegment}/profile/roles`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setIsPending(false);
    }
  };

  const isLocked = request?.status === "pending";

  return (
    <AppLayout
      className={styles.root({ className })}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.push(`/${roleSegment}/profile/roles`)}
          title={title}
        />
      }
    >
      <div className={styles.content()}>
        <Typography className={styles.subtitle()} color="muted" type="body">
          {isCoach ? t("wizardCoachSubtitle") : t("wizardOwnerSubtitle")}
        </Typography>

        {request?.status === "rejected" && request.review.reason ? (
          <Typography className={styles.reject()} role="status" type="body-sm">
            {t("rejectReason", { reason: request.review.reason })}
          </Typography>
        ) : null}

        {request?.status === "pending" ? (
          <Typography className={styles.notice()} role="status" type="body-sm">
            {t("statusPending")}
          </Typography>
        ) : null}

        <form className={styles.form()} onSubmit={(e) => void handleSubmit(e)}>
          {isCoach ? (
            <>
              <TextField
                className={styles.field()}
                fullWidth
                isDisabled={isLocked}
                name="headline"
                value={headline}
                onChange={setHeadline}
              >
                <Label>{t("headline")}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Prefix>
                    <Note1 size={FIELD_ICON} />
                  </InputGroup.Prefix>
                  <InputGroup.Input />
                </InputGroup>
              </TextField>

              <TextField
                className={styles.field()}
                fullWidth
                isDisabled={isLocked}
                name="years"
                value={years}
                onChange={setYears}
              >
                <Label>{t("years")}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Input inputMode="numeric" />
                </InputGroup>
              </TextField>
            </>
          ) : null}

          <TextField
            className={styles.field()}
            fullWidth
            isDisabled={isLocked}
            name="bio"
            value={bio}
            onChange={setBio}
          >
            <Label>{t("bio")}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Prefix>
                <Note1 size={FIELD_ICON} />
              </InputGroup.Prefix>
              <InputGroup.Input />
            </InputGroup>
          </TextField>

          <TextField
            className={styles.field()}
            fullWidth
            isDisabled={isLocked}
            name="note"
            value={note}
            onChange={setNote}
          >
            <Label>{t("note")}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Input />
            </InputGroup>
          </TextField>

          <div className={styles.upload()}>
            <Typography type="body-sm" weight="medium">
              {t("documents")}
            </Typography>
            <input
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
              disabled={isLocked || uploading}
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void handleUpload(file);
              }}
            />
            {documentId ? (
              <Typography color="muted" type="body-sm">
                {t("documentReady")}
              </Typography>
            ) : null}
          </div>

          {error ? (
            <Typography className={styles.error()} role="alert" type="body-sm">
              {error}
            </Typography>
          ) : null}
          {notice ? (
            <Typography className={styles.notice()} role="status" type="body-sm">
              {notice}
            </Typography>
          ) : null}

          <Button
            fullWidth
            isDisabled={isLocked || !documentId}
            isPending={isPending || uploading}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
