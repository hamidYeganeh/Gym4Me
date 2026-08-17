import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Telephone1 } from "@repo/icons";
import { useTranslations } from "next-intl";
import {
  authForgotPasswordPhoneFormDefaults,
  createAuthForgotPasswordPhoneFormSchema,
  toAuthForgotPasswordPhonePayload,
  type AuthForgotPasswordPhoneFormValues,
} from "./AuthForgotPasswordPhoneForm.schema";
import { authForgotPasswordPhoneFormVariants } from "./AuthForgotPasswordPhoneForm.styles";
import type { AuthForgotPasswordPhoneFormProps } from "./AuthForgotPasswordPhoneForm.types";

export function AuthForgotPasswordPhoneForm({
  className,
  error = null,
  isPending = false,
  onSubmit,
}: AuthForgotPasswordPhoneFormProps) {
  const t = useTranslations("Admin.ForgotPassword");
  const styles = authForgotPasswordPhoneFormVariants();

  const schema = useMemo(
    () =>
      createAuthForgotPasswordPhoneFormSchema({
        phoneRequired: t("validation.phoneRequired"),
        phoneInvalid: t("validation.phoneInvalid"),
      }),
    [t],
  );

  const form = useForm<AuthForgotPasswordPhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues: authForgotPasswordPhoneFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toAuthForgotPasswordPhonePayload(values));
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <TextField
            className={styles.field()}
            fullWidth
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            type="tel"
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("phoneLabel")}</Label>
            <div className={styles.inputWrap()}>
              <Telephone1 className={styles.inputIcon()} size={24} />
              <Input
                autoComplete="tel"
                className={styles.input()}
                placeholder={t("phonePlaceholder")}
                ref={field.ref}
              />
            </div>
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {error ? (
        <Typography className={styles.error()} role="alert">
          {error}
        </Typography>
      ) : null}

      <Button
        className={styles.submit()}
        fullWidth
        isPending={isPending}
        size="lg"
        type="submit"
        variant="primary"
      >
        {t("sendCode")}
        <ArrowRight size={24} />
      </Button>
    </form>
  );
}
