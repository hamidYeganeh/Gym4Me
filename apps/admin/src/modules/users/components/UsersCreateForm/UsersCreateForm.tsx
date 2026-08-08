import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Checkbox,
  CheckboxGroup,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import {
  AdminFormActions,
  AdminFormDrawer,
} from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { USER_ROLES } from "@/shared/lib/user-format";
import {
  createUsersCreateFormSchema,
  usersCreateFormDefaults,
  type UsersCreateFormValues,
} from "./UsersCreateForm.schema";
import { usersCreateFormVariants } from "./UsersCreateForm.styles";
import type { UsersCreateFormProps } from "./UsersCreateForm.types";

export function UsersCreateForm({
  isOpen,
  onOpenChange,
  onSubmit,
  className,
}: UsersCreateFormProps) {
  const t = useTranslations("Admin.Users");
  const tForm = useTranslations("Admin.Form");
  const styles = usersCreateFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createUsersCreateFormSchema({
        phoneRequired: t("createModal.errorRequired"),
        rolesRequired: t("createModal.errorRoles"),
      }),
    [t],
  );

  const form = useForm<UsersCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: usersCreateFormDefaults,
  });

  useEffect(() => {
    if (isOpen) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(usersCreateFormDefaults);
      setSubmitError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [form, isOpen]);

  const handleSubmit = form.handleSubmit(async (values, event) => {
    const intent = resolveFormSubmitIntent(event);
    setSubmitError(null);
    try {
      await onSubmit(values, intent);
      if (intent === "saveAndCreateNew") {
        form.reset(usersCreateFormDefaults);
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || t("createModal.errorGeneric")
          : t("createModal.errorGeneric"),
      );
    }
  });

  return (
    <AdminFormDrawer
      isOpen={isOpen}
      title={t("createModal.title")}
      onOpenChange={onOpenChange}
    >
      <form className={styles.form({ className })} onSubmit={handleSubmit}>
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("createModal.phone")}</Label>
              <Input
                placeholder={t("createModal.phonePlaceholder")}
                ref={field.ref}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

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
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("createModal.password")}</Label>
              <Input ref={field.ref} type="password" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="roles"
          render={({ field, fieldState }) => (
            <CheckboxGroup
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
            >
              <Label>{t("createModal.roles")}</Label>
              {USER_ROLES.map((item) => (
                <Checkbox key={item} value={item}>
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    {t(`roles.${item}`)}
                  </Checkbox.Content>
                </Checkbox>
              ))}
              <FieldError>{fieldState.error?.message}</FieldError>
            </CheckboxGroup>
          )}
        />

        {submitError ? (
          <p className={styles.formError()}>{submitError}</p>
        ) : null}

        <AdminFormActions
          cancelLabel={t("createModal.cancel")}
          isPending={form.formState.isSubmitting}
          saveAndCreateNewLabel={tForm("saveAndCreateNew")}
          saveLabel={tForm("save")}
          showSaveAndCreateNew
          onCancel={() => onOpenChange(false)}
        />
      </form>
    </AdminFormDrawer>
  );
}
