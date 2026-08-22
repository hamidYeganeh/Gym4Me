import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Avatar } from "@heroui/react/avatar";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { FileItem, type FileItemStatus } from "@repo/ui/kit/FileItem";
import { resolveFileItemType } from "@repo/ui/kit/FileItemType";
import { Uploader } from "@repo/ui/kit/Uploader";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { mediaApi } from "@/shared/lib/api";
import {
  adminProfileFormSchema,
  type AdminProfileFormValues,
} from "./AdminProfileForm.schema";
import { adminProfileFormVariants } from "./AdminProfileForm.styles";
import type { AdminProfileFormProps } from "./AdminProfileForm.types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
} as const;

export function AdminProfileForm({
  defaultValues,
  phone,
  formId = "admin-profile-form",
  onSubmit,
  className,
}: AdminProfileFormProps) {
  const t = useTranslations("Admin.Profile");
  const tForm = useTranslations("Admin.Form");
  const styles = adminProfileFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [upload, setUpload] = useState<{
    fileName: string;
    fileSize: string;
    status: FileItemStatus;
    progress: number;
    file: File | null;
  } | null>(null);

  const form = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileFormSchema),
    defaultValues,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) form.reset(defaultValues);
    });
    return () => {
      cancelled = true;
    };
  }, [defaultValues, form]);

  const avatarMediaId = form.watch("avatarMediaId");
  const avatarUrl = avatarMediaId ? mediaApi.fileUrl(avatarMediaId) : undefined;
  const fallback =
    `${form.watch("firstName")?.trim()?.[0] ?? ""}${form.watch("lastName")?.trim()?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const runUpload = async (file: File, onChange: (id: string) => void) => {
    setUpload({
      fileName: file.name,
      fileSize: formatBytes(file.size),
      status: "uploading",
      progress: 35,
      file,
    });
    try {
      const asset = await mediaApi.upload(file);
      setUpload({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        status: "success",
        progress: 100,
        file,
      });
      onChange(asset.id);
    } catch {
      setUpload({
        fileName: file.name,
        fileSize: formatBytes(file.size),
        status: "error",
        progress: 0,
        file,
      });
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || t("errorSave")
          : t("errorSave"),
      );
    }
  });

  return (
    <form
      className={styles.form({ className })}
      id={formId}
      onSubmit={handleSubmit}
    >
      <div className={styles.avatarBlock()}>
        <Avatar className={styles.avatarPreview()} size="lg">
          {avatarUrl ? (
            <Avatar.Image alt={t("avatar")} src={avatarUrl} />
          ) : null}
          <Avatar.Fallback>{fallback}</Avatar.Fallback>
        </Avatar>
        <Controller
          control={form.control}
          name="avatarMediaId"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Typography type="body-sm" weight="medium">
                {t("avatar")}
              </Typography>
              <Typography type="body-xs">{t("avatarHint")}</Typography>
              {!field.value ? (
                <Uploader
                  accept={IMAGE_ACCEPT}
                  buttonLabel={t("uploadButton")}
                  description={t("uploadDescription")}
                  title={t("uploadTitle")}
                  onDrop={(files) => {
                    const file = files[0];
                    if (file) void runUpload(file, field.onChange);
                  }}
                />
              ) : null}
              {upload || field.value ? (
                <FileItem
                  fileName={
                    upload?.fileName ?? (field.value ? "avatar.jpg" : "")
                  }
                  fileSize={upload?.fileSize}
                  progress={upload?.progress}
                  removeLabel={t("removeAvatar")}
                  retryLabel={t("retryUpload")}
                  status={upload?.status ?? "success"}
                  type={resolveFileItemType(upload?.fileName ?? "avatar.jpg")}
                  onRemove={() => {
                    setUpload(null);
                    field.onChange("");
                  }}
                  onRetry={() => {
                    if (upload?.file) {
                      void runUpload(upload.file, field.onChange);
                    }
                  }}
                />
              ) : null}
            </div>
          )}
        />
      </div>

      <div className={styles.row()}>
        <Controller
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("firstName")}</Label>
              <Input />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={form.control}
          name="lastName"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("lastName")}</Label>
              <Input />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      </div>

      <div className={styles.phone()}>
        <Typography type="body-sm" weight="medium">
          {t("phone")}
        </Typography>
        <Typography dir="ltr" type="body">
          {phone}
        </Typography>
      </div>

      {submitError ? (
        <Typography className={styles.error()} role="alert">
          {submitError}
        </Typography>
      ) : null}

      <AdminFormActions
        cancelLabel={tForm("cancel")}
        isPending={form.formState.isSubmitting}
        saveLabel={tForm("save")}
      />
    </form>
  );
}
