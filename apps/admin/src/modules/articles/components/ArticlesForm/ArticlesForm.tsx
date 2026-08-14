import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  PUBLISH_STATUSES,
} from "../../lib/article-constants";
import { ArticleCoverField } from "../ArticleCoverField";
import {
  articlesFormDefaults,
  createArticlesFormSchema,
  type ArticlesFormValues,
} from "./ArticlesForm.schema";
import { articlesFormVariants } from "./ArticlesForm.styles";
import type { ArticlesFormProps } from "./ArticlesForm.types";

const ArticleRichTextEditor = lazy(() =>
  import("../ArticleRichTextEditor").then((mod) => ({
    default: mod.ArticleRichTextEditor,
  })),
);

export function ArticlesForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: ArticlesFormProps) {
  const t = useTranslations("Admin.Articles");
  const tForm = useTranslations("Admin.Form");
  const tBasics = useTranslations("Admin.Basics");
  const styles = articlesFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const schema = useMemo(
    () => createArticlesFormSchema({ required: tForm("validation.required") }),
    [tForm],
  );

  const form = useForm<ArticlesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: articlesFormDefaults,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? articlesFormDefaults);
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
        form.reset(articlesFormDefaults);
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
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="category"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.category")}</Label>
            <Input placeholder={t("fields.categoryHint")} ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="kind"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("fields.kind")}</Label>
            <div className={styles.chips()}>
              {ARTICLE_KINDS.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`kinds.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="audience"
        render={({ field }) => (
          <div className={styles.field()}>
            <Label>{t("fields.audience")}</Label>
            <div className={styles.chips()}>
              {ARTICLE_AUDIENCES.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  type="button"
                  variant={field.value === value ? "primary" : "secondary"}
                  onPress={() => field.onChange(value)}
                >
                  {t(`audiences.${value}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="slug"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.slug")}</Label>
            <Input placeholder={t("fields.slugHint")} ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="excerpt"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.excerpt")}</Label>
            <TextArea className="min-h-20" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="body"
        render={({ field, fieldState }) => (
          <div className={styles.field()}>
            <Label>{t("fields.body")}</Label>
            <Suspense
              fallback={
                <div className="flex h-[420px] items-center justify-center">
                  <Spinner size="lg" />
                </div>
              }
            >
              <ArticleRichTextEditor
                disabled={form.formState.isSubmitting}
                value={field.value}
                onChange={field.onChange}
              />
            </Suspense>
            {fieldState.error?.message ? (
              <p className={styles.formError()}>{fieldState.error.message}</p>
            ) : null}
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="coverMediaId"
        render={({ field }) => (
          <ArticleCoverField
            disabled={form.formState.isSubmitting}
            errorMessage={tBasics("media.error")}
            hint={t("fields.coverHint")}
            label={t("fields.cover")}
            removeLabel={tBasics("media.remove")}
            retryLabel={tBasics("media.retry")}
            successMessage={tBasics("media.success")}
            uploaderButtonLabel={tBasics("media.uploaderButton")}
            uploaderDescription={tBasics("media.uploaderDescription")}
            uploaderTitle={tBasics("media.uploaderTitle")}
            value={field.value}
            onChange={field.onChange}
          />
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

      <Controller
        control={form.control}
        name="tags"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.tags")}</Label>
            <Input placeholder={t("fields.tagsHint")} ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="seoTitle"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.seoTitle")}</Label>
            <Input ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="seoDescription"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("fields.seoDescription")}</Label>
            <TextArea className="min-h-20" ref={field.ref} />
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
