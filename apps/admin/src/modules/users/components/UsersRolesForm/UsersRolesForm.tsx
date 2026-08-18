import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "@heroui/react/checkbox";
import { CheckboxGroup } from "@heroui/react/checkbox-group";
import { FieldError } from "@heroui/react/field-error";
import { Label } from "@heroui/react/label";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { USER_ROLES } from "@/shared/lib/user-format";
import {
  createUsersRolesFormSchema,
  type UsersRolesFormValues,
} from "./UsersRolesForm.schema";
import { usersRolesFormVariants } from "./UsersRolesForm.styles";
import type { UsersRolesFormProps } from "./UsersRolesForm.types";

export function UsersRolesForm({
  defaultValues,
  onSubmit,
  className,
}: UsersRolesFormProps) {
  const t = useTranslations("Admin.Users");
  const tForm = useTranslations("Admin.Form");
  const styles = usersRolesFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createUsersRolesFormSchema({
        rolesRequired: t("createModal.errorRoles"),
      }),
    [t],
  );

  const form = useForm<UsersRolesFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
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

      {submitError ? <Typography className={styles.formError()}>{submitError}</Typography> : null}

      <AdminFormActions
        cancelLabel={tForm("cancel")}
        isDisabled={!form.formState.isValid}
        isPending={form.formState.isSubmitting}
        saveLabel={tForm("save")}
      />
    </form>
  );
}
