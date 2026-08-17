import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GeoDirection } from "@repo/api";
import { ApiError } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormActions } from "@/shared/components";
import { resolveFormSubmitIntent } from "@/shared/lib/form-submit-intent";
import {
  MOCK_CLUB_CATEGORIES,
  MOCK_CLUB_OWNERS,
  MOCK_CLUB_SPORTS,
} from "../../lib/clubs-data";
import {
  clubsCreateFormDefaults,
  clubsCreateFormPrefill,
  createClubsCreateFormSchema,
  type ClubsCreateFormValues,
} from "./ClubsCreateForm.schema";
import { clubsCreateFormVariants } from "./ClubsCreateForm.styles";
import type { ClubsCreateFormProps } from "./ClubsCreateForm.types";

const DIRECTIONS: GeoDirection[] = [
  "north",
  "south",
  "east",
  "west",
  "center",
];

export function ClubsCreateForm({
  onCancel,
  onSubmit,
  initialValues = null,
  mode = "create",
  className,
}: ClubsCreateFormProps) {
  const t = useTranslations("Admin.Clubs");
  const tForm = useTranslations("Admin.Form");
  const styles = clubsCreateFormVariants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  const schema = useMemo(
    () =>
      createClubsCreateFormSchema({
        required: t("createModal.errorRequired"),
      }),
    [t],
  );

  const form = useForm<ClubsCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: clubsCreateFormPrefill,
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      form.reset(initialValues ?? clubsCreateFormPrefill);
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
      if (!isEdit && intent === "saveAndCreateNew") {
        form.reset(clubsCreateFormPrefill);
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiError || err instanceof Error
          ? err.message || t("createModal.errorGeneric")
          : t("createModal.errorGeneric"),
      );
    }
  });

  return (
    <form className={styles.form({ className })} onSubmit={handleSubmit}>
        {!isEdit ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <Typography className={styles.mockHint()}>{t("usingMock")}</Typography>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onPress={() => form.reset(clubsCreateFormPrefill)}
              >
                {t("createModal.loadMock")}
              </Button>
            </div>

            <Controller
              control={form.control}
              name="ownerId"
              render={({ field, fieldState }) => (
                <Select
                  isInvalid={fieldState.invalid}
                  isRequired
                  placeholder={t("createModal.owner")}
                  value={field.value || null}
                  onChange={(value) => field.onChange(String(value ?? ""))}
                >
                  <Label>{t("createModal.owner")}</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {MOCK_CLUB_OWNERS.map((owner) => (
                        <ListBox.Item
                          key={owner.id}
                          id={owner.id}
                          textValue={`${owner.name} ${owner.phone}`}
                        >
                          {owner.name} · {owner.phone}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Select>
              )}
            />
          </>
        ) : null}

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("createModal.name")}</Label>
              <Input
                placeholder={t("createModal.namePlaceholder")}
                ref={field.ref}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("createModal.description")}</Label>
              <TextArea
                placeholder={t("createModal.descriptionPlaceholder")}
                ref={field.ref}
                rows={3}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <div className={styles.formRow()}>
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
                  dir="ltr"
                  placeholder={t("createModal.phonePlaceholder")}
                  ref={field.ref}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={form.control}
            name="phoneLabel"
            render={({ field, fieldState }) => (
              <TextField
                isInvalid={fieldState.invalid}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              >
                <Label>{t("createModal.phoneLabel")}</Label>
                <Input ref={field.ref} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="website"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("createModal.website")}</Label>
              <Input dir="ltr" ref={field.ref} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <TextField
              isInvalid={fieldState.invalid}
              isRequired
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("createModal.address")}</Label>
              <Input
                placeholder={t("createModal.addressPlaceholder")}
                ref={field.ref}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <Controller
          control={form.control}
          name="direction"
          render={({ field }) => (
            <Select
              placeholder={t("createModal.direction")}
              value={field.value}
              onChange={(value) =>
                field.onChange(String(value ?? "center") as GeoDirection)
              }
            >
              <Label>{t("createModal.direction")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {DIRECTIONS.map((dir) => (
                    <ListBox.Item
                      key={dir}
                      id={dir}
                      textValue={t(`direction.${dir}`)}
                    >
                      {t(`direction.${dir}`)}
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
          name="categoryIds"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value}
              onChange={(value) => field.onChange(value as string[])}
            >
              <Label>{t("createModal.categoryIds")}</Label>
              {MOCK_CLUB_CATEGORIES.map((cat) => (
                <Checkbox key={cat.id} value={cat.id}>
                  {cat.name}
                </Checkbox>
              ))}
            </CheckboxGroup>
          )}
        />

        <Controller
          control={form.control}
          name="sportIds"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value}
              onChange={(value) => field.onChange(value as string[])}
            >
              <Label>رشته‌ها</Label>
              {MOCK_CLUB_SPORTS.map((sport) => (
                <Checkbox key={sport.id} value={sport.id}>
                  {sport.name}
                </Checkbox>
              ))}
            </CheckboxGroup>
          )}
        />

        <Controller
          control={form.control}
          name="genderPolicy"
          render={({ field }) => (
            <Select
              placeholder={t("createModal.genderPolicy")}
              value={field.value || "mixed"}
              onChange={(value) => field.onChange(String(value ?? "mixed"))}
            >
              <Label>{t("createModal.genderPolicy")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {(
                    [
                      ["mixed", "createModal.genderMixed"],
                      ["female_only", "createModal.genderFemale"],
                      ["male_only", "createModal.genderMale"],
                    ] as const
                  ).map(([id, key]) => (
                    <ListBox.Item key={id} id={id} textValue={t(key)}>
                      {t(key)}
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
          name="accessibility"
          render={({ field }) => (
            <Select
              placeholder={t("createModal.accessibility")}
              value={field.value || "standard"}
              onChange={(value) =>
                field.onChange(String(value ?? "standard"))
              }
            >
              <Label>{t("createModal.accessibility")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item
                    id="standard"
                    textValue={t("createModal.accessibilityStandard")}
                  >
                    {t("createModal.accessibilityStandard")}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item
                    id="accessible"
                    textValue={t("createModal.accessibilityAccessible")}
                  >
                    {t("createModal.accessibilityAccessible")}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          )}
        />

        <Controller
          control={form.control}
          name="ageGroupKeys"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value}
              onChange={(value) => field.onChange(value as string[])}
            >
              <Label>{t("createModal.ageGroups")}</Label>
              {(
                [
                  ["kids", "createModal.ageKids"],
                  ["teens", "createModal.ageTeens"],
                  ["adults", "createModal.ageAdults"],
                  ["seniors", "createModal.ageSeniors"],
                ] as const
              ).map(([id, key]) => (
                <Checkbox key={id} value={id}>
                  {t(key)}
                </Checkbox>
              ))}
            </CheckboxGroup>
          )}
        />

        <Controller
          control={form.control}
          name="levelKeys"
          render={({ field }) => (
            <CheckboxGroup
              value={field.value}
              onChange={(value) => field.onChange(value as string[])}
            >
              <Label>{t("createModal.levels")}</Label>
              {(
                [
                  ["local", "createModal.levelLocal"],
                  ["standard", "createModal.levelStandard"],
                  ["premium", "createModal.levelPremium"],
                  ["elite", "createModal.levelElite"],
                ] as const
              ).map(([id, key]) => (
                <Checkbox key={id} value={id}>
                  {t(key)}
                </Checkbox>
              ))}
            </CheckboxGroup>
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
          saveLabel={tForm("save")}
          showSaveAndCreateNew={!isEdit}
          onCancel={onCancel}
        />

        <Button
          className="sr-only"
          tabIndex={-1}
          type="button"
          onPress={() => form.reset(clubsCreateFormDefaults)}
        />
      </form>
  );
}
