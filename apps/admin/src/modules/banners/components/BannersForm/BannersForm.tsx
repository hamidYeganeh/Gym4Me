import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { FieldError } from "@heroui/react/field-error";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminDatePicker, AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import { BannerSlidesField } from "../BannerSlidesField";
import {
  BANNER_ASPECT_RATIOS,
  BANNER_PLACEMENTS,
  BANNER_RADII,
  BANNER_RATIO_I18N_KEYS,
  PUBLISH_STATUSES,
} from "../../lib/banner-constants";
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
        err instanceof ApiError
          ? err.message || t("actionError")
          : t("actionError"),
      );
    }
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="label"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.label")}</Label>
            <Input placeholder={t("fields.labelHint")} ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      {isEdit && initialValues?.slug ? (
        <TextField isReadOnly name="slug" value={initialValues.slug}>
          <Label>{t("fields.slug")}</Label>
          <Input dir="ltr" readOnly value={initialValues.slug} />
        </TextField>
      ) : null}

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
        name="ratio"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("fields.ratio")}</Label>
            <div className={styles.chips()}>
              {BANNER_ASPECT_RATIOS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`ratios.${BANNER_RATIO_I18N_KEYS[value]}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="radius"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("fields.radius")}</Label>
            <div className={styles.chips()}>
              {BANNER_RADII.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`radii.${value}`)}
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
              frameRadius={form.watch("radius")}
              frameRatio={form.watch("ratio")}
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
                gradientLabel: t("fields.gradient"),
                ratioLabel: t("fields.ratio"),
                ratios: {
                  "16/9": t("ratios.16x9"),
                  "2/1": t("ratios.2x1"),
                  "4/3": t("ratios.4x3"),
                  "1/1": t("ratios.1x1"),
                },
                radiusLabel: t("fields.radius"),
                radii: {
                  none: t("radii.none"),
                  sm: t("radii.sm"),
                  field: t("radii.field"),
                  compact: t("radii.compact"),
                  auth: t("radii.auth"),
                  surface: t("radii.surface"),
                  full: t("radii.full"),
                },
                titleTextLabel: t("fields.slideTitle"),
                titlePlacementLabel: t("fields.titlePlacement"),
                actionLabelLabel: t("fields.actionLabel"),
                actionPlacementLabel: t("fields.actionPlacement"),
                overlayPlacements: {
                  "top-start": t("overlayPlacements.top-start"),
                  "top-center": t("overlayPlacements.top-center"),
                  "top-end": t("overlayPlacements.top-end"),
                  "center-start": t("overlayPlacements.center-start"),
                  center: t("overlayPlacements.center"),
                  "center-end": t("overlayPlacements.center-end"),
                  "bottom-start": t("overlayPlacements.bottom-start"),
                  "bottom-center": t("overlayPlacements.bottom-center"),
                  "bottom-end": t("overlayPlacements.bottom-end"),
                },
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
              <Typography className={styles.formError()}>
                {fieldState.error.message}
              </Typography>
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
            <AdminDatePicker
              error={fieldState.error?.message}
              granularity="minute"
              label={t("fields.startsAt")}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={form.control}
          name="endsAt"
          render={({ field, fieldState }) => (
            <AdminDatePicker
              error={fieldState.error?.message}
              granularity="minute"
              label={t("fields.endsAt")}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
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
        <Typography className={styles.formError()} role="alert">
          {submitError}
        </Typography>
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
