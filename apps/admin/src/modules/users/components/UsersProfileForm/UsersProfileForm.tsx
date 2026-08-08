import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldError, Input, Label, TextField } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import {
  createUsersProfileFormSchema,
  type UsersProfileFormValues,
} from "./UsersProfileForm.schema";
import { usersProfileFormVariants } from "./UsersProfileForm.styles";
import type { UsersProfileFormProps } from "./UsersProfileForm.types";

export function UsersProfileForm({
  defaultValues,
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

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
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
              <Input ref={field.ref} />
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
              <Input ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      </div>

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
            <Input ref={field.ref} inputMode="numeric" maxLength={10} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {submitError ? <p className={styles.formError()}>{submitError}</p> : null}

      <AdminFormActions
        cancelLabel={tForm("cancel")}
        isPending={form.formState.isSubmitting}
        saveLabel={tForm("save")}
      />
    </form>
  );
}
