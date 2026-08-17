import { useEffect, useMemo, useState, type Key } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  clubSlotsFormDefaults,
  createClubSlotsFormSchema,
  type ClubSlotsFormValues,
} from "./ClubSlotsForm.schema";
import { clubSlotsFormVariants } from "./ClubSlotsForm.styles";
import type { ClubSlotsFormProps } from "./ClubSlotsForm.types";

const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

export function ClubSlotsForm({
  classes,
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: ClubSlotsFormProps) {
  const t = useTranslations("Admin.Clubs");
  const tForm = useTranslations("Admin.Form");
  const styles = clubSlotsFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const schema = useMemo(
    () =>
      createClubSlotsFormSchema({
        required: tForm("validation.required"),
        classRequired: t("slots.errorClassRequired"),
      }),
    [t, tForm],
  );
  const form = useForm<ClubSlotsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: clubSlotsFormDefaults,
  });
  const kind = form.watch("kind");
  const recurrenceType = form.watch("recurrenceType");
  const activeClasses = useMemo(
    () => classes.filter((item) => item.status !== "archived"),
    [classes],
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? clubSlotsFormDefaults);
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
        form.reset({
          ...clubSlotsFormDefaults,
          classId: activeClasses[0]?.id ?? "",
        });
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : err instanceof ApiError
            ? err.message || t("slots.errorSave")
            : t("slots.errorSave"),
      );
    }
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="kind"
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={(value: Key | Key[] | null) => {
              if (value === "class" || value === "session") {
                field.onChange(value);
              }
            }}
          >
            <Label>{t("slots.kind")}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="class" textValue={t("slots.kindClass")}>
                  {t("slots.kindClass")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="session" textValue={t("slots.kindSession")}>
                  {t("slots.kindSession")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />
      {kind === "class" ? (
        activeClasses.length > 0 ? (
          <Controller
            control={form.control}
            name="classId"
            render={({ field }) => (
              <Select
                value={field.value || activeClasses[0]?.id || null}
                onChange={(value: Key | Key[] | null) =>
                  field.onChange(String(value ?? ""))
                }
              >
                <Label>{t("slots.class")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {activeClasses.map((item) => (
                      <ListBox.Item id={item.id} key={item.id} textValue={item.title}>
                        {item.title}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
        ) : (
          <Controller
            control={form.control}
            name="newClassTitle"
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                isRequired
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                <Label>{t("slots.newClassTitle")}</Label>
                <Input placeholder={t("slots.newClassPlaceholder")} ref={field.ref} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
        )
      ) : null}
      <Controller
        control={form.control}
        name="recurrenceType"
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={(value: Key | Key[] | null) => {
              if (value === "weekly" || value === "once") {
                field.onChange(value);
              }
            }}
          >
            <Label>{t("slots.recurrenceType")}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="weekly" textValue={t("slots.recurrenceWeekly")}>
                  {t("slots.recurrenceWeekly")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="once" textValue={t("slots.recurrenceOnce")}>
                  {t("slots.recurrenceOnce")}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />
      {recurrenceType === "weekly" ? (
        <>
          <Controller
            control={form.control}
            name="weekday"
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value: Key | Key[] | null) =>
                  field.onChange(String(value ?? "0"))
                }
              >
                <Label>{t("slots.weekdayLabel")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {WEEKDAY_VALUES.map((day) => (
                      <ListBox.Item
                        id={String(day)}
                        key={day}
                        textValue={t(`slots.weekday.${day}`)}
                      >
                        {t(`slots.weekday.${day}`)}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            )}
          />
          <Controller
            control={form.control}
            name="startsOn"
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                isRequired
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                <Label>{t("slots.startsOn")}</Label>
                <Input dir="ltr" placeholder="YYYY-MM-DD" ref={field.ref} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={form.control}
            name="endsOn"
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                <Label>{t("slots.endsOn")}</Label>
                <Input dir="ltr" placeholder="YYYY-MM-DD" ref={field.ref} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
        </>
      ) : (
        <Controller
          control={form.control}
          name="onceDate"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("slots.onceDate")}</Label>
              <Input dir="ltr" placeholder="YYYY-MM-DD" ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
      )}
      <Controller
        control={form.control}
        name="startTime"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("slots.startTime")}</Label>
            <Input dir="ltr" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="endTime"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("slots.endTime")}</Label>
            <Input dir="ltr" ref={field.ref} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="capacity"
        render={({ field, fieldState }) => (
          <TextField
            isInvalid={fieldState.invalid}
            isRequired
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
          >
            <Label>{t("slots.capacity")}</Label>
            <Input dir="ltr" inputMode="numeric" ref={field.ref} />
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
        cancelLabel={tForm("cancel")}
        isPending={form.formState.isSubmitting}
        saveAndCreateNewLabel={tForm("saveAndCreateNew")}
        saveLabel={isEdit ? t("slots.saveEdit") : t("slots.save")}
        showSaveAndCreateNew={!isEdit}
        onCancel={onCancel}
      />
    </form>
  );
}
