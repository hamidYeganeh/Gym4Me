import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Avatar } from "@heroui/react/avatar";
import { FieldError } from "@heroui/react/field-error";
import { InputGroup } from "@heroui/react/input-group";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { FileUpload } from "@repo/icons/FileUpload";
import { HashTag1 } from "@repo/icons/HashTag1";
import { Mobile } from "@repo/icons/Mobile";
import { User } from "@repo/icons/User";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { mediaApi } from "@/shared/lib/api";
import { userDisplayName } from "@/shared/lib/user-format";
import {
  createUsersProfileFormSchema,
  type UsersProfileFormValues,
} from "./UsersProfileForm.schema";
import { usersProfileFormVariants } from "./UsersProfileForm.styles";
import type { UsersProfileFormProps } from "./UsersProfileForm.types";

export function UsersProfileForm({
  defaultValues,
  phone,
  user,
  formId = "users-profile-form",
  onSubmit,
  className,
}: UsersProfileFormProps) {
  const t = useTranslations("Admin.Users");
  const tForm = useTranslations("Admin.Form");
  const styles = usersProfileFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createUsersProfileFormSchema({
        nationalIdInvalid: t("detail.nationalIdInvalid"),
      }),
    [t],
  );

  const form = useForm<UsersProfileFormValues>({
    resolver: zodResolver(schema),
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

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || t("detail.errorSave")
          : t("detail.errorSave"),
      );
    }
  });

  const displayName = userDisplayName(user, t("detail.unnamed"));
  const avatarUrl = user.avatar.mediaId
    ? mediaApi.fileUrl(user.avatar.mediaId)
    : undefined;
  const fallback =
    `${user.name.first?.trim()?.[0] ?? ""}${user.name.last?.trim()?.[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <form
      className={styles.form({ className })}
      id={formId}
      onSubmit={handleSubmit}
    >
      <div className={styles.formRow()}>
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
              <Label>{t("createModal.firstName")}</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <User className={styles.fieldIcon()} size={18} />
                </InputGroup.Prefix>
                <InputGroup.Input ref={field.ref} />
              </InputGroup>
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
              <Label>{t("createModal.lastName")}</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <User className={styles.fieldIcon()} size={18} />
                </InputGroup.Prefix>
                <InputGroup.Input ref={field.ref} />
              </InputGroup>
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
        <TextField isReadOnly value={phone}>
          <Label>{t("columns.phone")}</Label>
          <InputGroup>
            <InputGroup.Prefix>
              <Mobile className={styles.fieldIcon()} size={18} />
            </InputGroup.Prefix>
            <InputGroup.Input />
          </InputGroup>
        </TextField>
        <Controller
          control={form.control}
          name="nationalId"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("detail.nationalId")}</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <HashTag1 className={styles.fieldIcon()} size={18} />
                </InputGroup.Prefix>
                <InputGroup.Input
                  ref={field.ref}
                  inputMode="numeric"
                  maxLength={10}
                />
              </InputGroup>
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      </div>

      <div className={styles.avatarBlock()}>
        <Typography className={styles.avatarLabel()}>
          {t("detail.changeAvatar")}
        </Typography>
        <div className={styles.avatarRow()}>
          <Avatar className={styles.avatarPreview()} size="lg">
            {avatarUrl ? (
              <Avatar.Image alt={displayName} src={avatarUrl} />
            ) : null}
            <Avatar.Fallback className={styles.avatarFallback()}>
              {fallback}
            </Avatar.Fallback>
          </Avatar>
          <div className={styles.dropzone()} role="note">
            <FileUpload className={styles.dropIcon()} size={28} />
            <Typography className={styles.dropTitle()}>
              <span className={styles.dropHighlight()}>
                {t("detail.avatarUploadHighlight")}
              </span>{" "}
              {t("detail.avatarUploadRest")}
            </Typography>
            <Typography className={styles.dropHint()}>
              {t("detail.avatarUploadFormats")}
            </Typography>
          </div>
        </div>
      </div>

      {submitError ? (
        <Typography className={styles.formError()}>{submitError}</Typography>
      ) : null}

      <AdminFormActions
        cancelLabel={tForm("cancel")}
        isPending={form.formState.isSubmitting}
        saveLabel={tForm("save")}
      />
    </form>
  );
}
