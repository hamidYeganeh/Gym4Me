"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/shared/lib/app-router";

import { Button } from "@heroui/react/button";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import type { Role, RoleRequest } from "@repo/api";
import { ApiError } from "@repo/api";
import { Note1 } from "@repo/icons/Note1";
import { FileItem, type FileItemStatus } from "@repo/ui/kit/FileItem";
import { Uploader } from "@repo/ui/kit/Uploader";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { accountRoles, mediaApi } from "@/shared/lib/api";
import {
  ImageCropperSheet,
  useImageCropper,
} from "@/shared/components/ImageCropperSheet";
import { roleRequestWizardScreenVariants } from "./RoleRequestWizardScreen.styles";
import type { RoleRequestWizardScreenProps } from "./RoleRequestWizardScreen.types";

const FIELD_ICON = 18;

const DOCUMENT_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
} as const;

type DocumentUploadState = {
  fileName: string;
  fileSize: string;
  status: FileItemStatus;
  progress: number;
  file: File | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [documentUpload, setDocumentUpload] =
    useState<DocumentUploadState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { cropImage, cropperProps } = useImageCropper();

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

  const uploadDocument = async (file: File) => {
    setDocumentUpload({
      fileName: file.name,
      fileSize: formatBytes(file.size),
      status: "uploading",
      progress: 35,
      file,
    });
    setError(null);
    try {
      const uploaded = await mediaApi.upload(file);
      setDocumentId(uploaded.id);
      setDocumentUpload({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        status: "success",
        progress: 100,
        file,
      });
      setNotice(t("documentUploaded"));
    } catch (err) {
      setDocumentUpload({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        status: "error",
        progress: 65,
        file,
      });
      setError(err instanceof ApiError ? err.message : t("error"));
    }
  };

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

  const isDocumentUploading =
    !isCoach && documentUpload?.status === "uploading";
  const showOwnerUploader =
    !isCoach &&
    !documentId &&
    (!documentUpload || documentUpload.status === "error");
  const showOwnerFileItem =
    !isCoach &&
    (Boolean(documentId) ||
      (documentUpload != null &&
        (documentUpload.status === "uploading" ||
          documentUpload.status === "success" ||
          documentUpload.status === "error")));

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
        yearsExperience: isCoach && years.trim() ? Number(years) : undefined,
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

            {showOwnerUploader ? (
              <Uploader
                accept={DOCUMENT_ACCEPT}
                buttonLabel={t("uploaderButton")}
                description={t("uploaderDescription")}
                disabled={isLocked}
                maxFiles={1}
                multiple={false}
                title={t("uploaderTitle")}
                onDropAccepted={(files) => {
                  const file = files[0];
                  if (!file) return;
                  void cropImage(file, 4 / 3).then((cropped) => {
                    if (cropped) void uploadDocument(cropped);
                  });
                }}
              />
            ) : null}

            {showOwnerFileItem ? (
              <FileItem
                fileName={documentUpload?.fileName ?? t("documentReady")}
                fileSize={documentUpload?.fileSize}
                progress={documentUpload?.progress}
                removeLabel={t("removeUpload")}
                retryLabel={t("retryUpload")}
                status={
                  documentUpload?.status === "uploading"
                    ? "uploading"
                    : documentUpload?.status === "error"
                      ? "error"
                      : "success"
                }
                statusMessage={
                  documentUpload?.status === "error"
                    ? t("uploadError")
                    : documentId
                      ? t("documentReady")
                      : undefined
                }
                onRemove={() => {
                  setDocumentUpload(null);
                  setDocumentId(null);
                  setNotice(null);
                }}
                onRetry={() => {
                  const file = documentUpload?.file;
                  if (!file) return;
                  void uploadDocument(file);
                }}
              />
            ) : null}

            {isCoach ? (
              <>
                <input
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
                  disabled={isLocked || uploading}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    event.target.value = "";
                    if (file) {
                      void cropImage(file, 4 / 3).then((cropped) => {
                        if (cropped) void handleUpload(cropped);
                      });
                    }
                  }}
                />
                {documentId ? (
                  <Typography color="muted" type="body-sm">
                    {t("documentReady")}
                  </Typography>
                ) : null}
              </>
            ) : null}
          </div>

          {error ? (
            <Typography className={styles.error()} role="alert" type="body-sm">
              {error}
            </Typography>
          ) : null}
          {notice ? (
            <Typography
              className={styles.notice()}
              role="status"
              type="body-sm"
            >
              {notice}
            </Typography>
          ) : null}

          <Button
            fullWidth
            isDisabled={isLocked || !documentId}
            isPending={isPending || uploading || isDocumentUploading}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t("submit")}
          </Button>
        </form>
      </div>
      <ImageCropperSheet {...cropperProps} />
    </AppLayout>
  );
}
