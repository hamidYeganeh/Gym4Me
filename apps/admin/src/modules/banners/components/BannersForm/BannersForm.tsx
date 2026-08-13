import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { BannerSlidesField } from "../BannerSlidesField";
import { BANNER_PLACEMENTS, PUBLISH_STATUSES } from "../../lib/banner-constants";
import {
  bannersFormDefaults,
  createBannersFormSchema,
  type BannersFormValues,
} from "./BannersForm.schema";
import { bannersFormVariants } from "./BannersForm.styles";
import type { BannersFormProps } from "./BannersForm.types";

export function BannersForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: BannersFormProps) {
  const t = useTranslations("Admin.Banners");
  const tForm = useTranslations("Admin.Form");
  const styles = bannersFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const schema = useMemo(
    () =>
      createBannersFormSchema({
        required: tForm("validation.required"),
        slidesRequired: tForm("validation.required"),
      }),
    [tForm],
  );

  const form = useForm<BannersFormValues>({
    resolver: zodResolver(schema),
    defaultValues: bannersFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? bannersFormDefaults);
      setSubmitError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [form, initialValues]);

  const handleSubmit = form.handleSubmit(async (values, event) => {
    const intent = resolveFormSubmitIntent(event);
    setSubmitError(null);
    try {
      await onSubmit(values, intent);
      if (intent === "saveAndCreateNew") {
        form.reset(bannersFormDefaults);
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message || t("actionError") : t("actionError"),
      );
    }
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.title")}</Label>
            <Input placeholder={t("fields.titleHint")} ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="placement"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("fields.placement")}</Label>
            <div className={styles.chips()}>
              {BANNER_PLACEMENTS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`placements.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="slides"
        render={({ field, fieldState }) => (
          <div className={styles.field()}>
            <BannerSlidesField
              disabled={form.formState.isSubmitting}
              labels={{
                label: t("fields.slides"),
                hint: t("fields.slidesHint"),
                empty: t("fields.slidesEmpty"),
                linkKindLabel: t("fields.linkKind"),
                linkKinds: {
                  none: t("linkKinds.none"),
                  internal: t("linkKinds.internal"),
                  external: t("linkKinds.external"),
                },
                linkUrlLabel: t("fields.linkUrl"),
                linkUrlInternalHint: t("fields.linkUrlInternalHint"),
                linkUrlExternalHint: t("fields.linkUrlExternalHint"),
                altLabel: t("fields.alt"),
                remove: t("actions.removeSlide"),
                uploaderTitle: t("uploader.title"),
                uploaderDescription: t("uploader.description"),
                uploaderButtonLabel: t("uploader.button"),
                uploadError: t("uploader.error"),
              }}
              value={field.value}
              onChange={field.onChange}
            />
            {fieldState.error?.message ? (
              <p className={styles.formError()}>{fieldState.error.message}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="publishStatus"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("fields.publishStatus")}</Label>
            <div className={styles.chips()}>
              {PUBLISH_STATUSES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`publishStatus.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      <div className={styles.scheduleRow()}>
        <Controller
          control={form.control}
          name="startsAt"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("fields.startsAt")}</Label>
              <Input dir="ltr" ref={field.ref} type="datetime-local" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={form.control}
          name="endsAt"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("fields.endsAt")}</Label>
              <Input dir="ltr" ref={field.ref} type="datetime-local" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="order"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.order")}</Label>
            <Input inputMode="numeric" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {submitError ? (
        <p className={styles.formError()} role="alert">
          {submitError}
        </p>
      ) : null}

      <AdminFormActions
        cancelLabel={t("cancel")}
        isPending={form.formState.isSubmitting}
        saveAndCreateNewLabel={tForm("saveAndCreateNew")}
        saveLabel={tForm("save")}
        showSaveAndCreateNew={!isEdit}
        onCancel={onCancel}
      />
    </form>
  );
}
