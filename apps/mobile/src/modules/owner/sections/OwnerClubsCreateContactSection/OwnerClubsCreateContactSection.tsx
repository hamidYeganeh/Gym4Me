"use client";

import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { Trash1 } from "@repo/icons/Trash1";
import { useTranslations } from "next-intl";
import {
  createPhoneDraft,
  createSocialDraft,
  SOCIAL_PLATFORM_OPTIONS,
} from "../../lib/club-create-form";
import { ownerClubsCreateContactSectionVariants } from "./OwnerClubsCreateContactSection.styles";
import type { OwnerClubsCreateContactSectionProps } from "./OwnerClubsCreateContactSection.types";

export function OwnerClubsCreateContactSection({
  control,
  className,
}: OwnerClubsCreateContactSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateContactSectionVariants();

  const phones = useFieldArray({ control, name: "phones" });
  const socials = useFieldArray({ control, name: "socials" });

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepContact")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepContactHint")}
        </Typography>
      </div>

      <div className={styles.form()}>
        <div className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body" weight="semibold">
            {t("phones")}
          </Typography>

          {phones.fields.map((field, index) => (
            <div className={styles.row()} key={field.id}>
              <div className={styles.rowFields()}>
                <Controller
                  control={control}
                  name={`phones.${index}.number`}
                  render={({ field: phoneField }) => (
                    <TextField
                      className={styles.field()}
                      fullWidth
                      name={phoneField.name}
                      value={phoneField.value}
                      onBlur={phoneField.onBlur}
                      onChange={phoneField.onChange}
                    >
                      <Label>{t("phone")}</Label>
                      <Input
                        dir="ltr"
                        placeholder={t("phonePlaceholder")}
                        ref={phoneField.ref}
                        type="tel"
                      />
                    </TextField>
                  )}
                />
                <Controller
                  control={control}
                  name={`phones.${index}.label`}
                  render={({ field: labelField }) => (
                    <TextField
                      className={styles.field()}
                      fullWidth
                      name={labelField.name}
                      value={labelField.value}
                      onBlur={labelField.onBlur}
                      onChange={labelField.onChange}
                    >
                      <Label>{t("phoneLabel")}</Label>
                      <Input
                        placeholder={t("phoneLabelPlaceholder")}
                        ref={labelField.ref}
                      />
                    </TextField>
                  )}
                />
              </div>
              {phones.fields.length > 1 ? (
                <div className={styles.rowActions()}>
                  <Button
                    aria-label={t("removePhone")}
                    isIconOnly
                    size="lg"
                    variant="ghost"
                    onPress={() => phones.remove(index)}
                  >
                    <Trash1 size={18} />
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          <Button
            size="md"
            variant="outline"
            onPress={() => phones.append(createPhoneDraft())}
          >
            <Plus size={18} />
            {t("addPhone")}
          </Button>
        </div>

        <Controller
          control={control}
          name="website"
          render={({ field }) => (
            <TextField
              className={styles.field()}
              fullWidth
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            >
              <Label>{t("website")}</Label>
              <Input
                dir="ltr"
                placeholder={t("websitePlaceholder")}
                ref={field.ref}
                type="url"
              />
            </TextField>
          )}
        />

        <div className={styles.group()}>
          <Typography className={styles.groupTitle()} type="body" weight="semibold">
            {t("socials")}
          </Typography>

          {socials.fields.map((field, index) => (
            <div className={styles.row()} key={field.id}>
              <div className={styles.rowFields()}>
                <Controller
                  control={control}
                  name={`socials.${index}.platform`}
                  render={({ field: platformField }) => (
                    <Select
                      className={styles.field()}
                      placeholder={t("socialPlatform")}
                      value={platformField.value || null}
                      onChange={(value) =>
                        platformField.onChange(String(value ?? "instagram"))
                      }
                    >
                      <Label>{t("socialPlatform")}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {SOCIAL_PLATFORM_OPTIONS.map((platform) => (
                            <ListBox.Item
                              key={platform}
                              id={platform}
                              textValue={t(`socialPlatforms.${platform}`)}
                            >
                              {t(`socialPlatforms.${platform}`)}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />
                <Controller
                  control={control}
                  name={`socials.${index}.url`}
                  render={({ field: urlField }) => (
                    <TextField
                      className={styles.field()}
                      fullWidth
                      name={urlField.name}
                      value={urlField.value}
                      onBlur={urlField.onBlur}
                      onChange={urlField.onChange}
                    >
                      <Label>{t("socialUrl")}</Label>
                      <Input
                        dir="ltr"
                        placeholder={t("socialUrlPlaceholder")}
                        ref={urlField.ref}
                        type="url"
                      />
                    </TextField>
                  )}
                />
              </div>
              <div className={styles.rowActions()}>
                <Button
                  aria-label={t("removeSocial")}
                  isIconOnly
                  size="lg"
                  variant="ghost"
                  onPress={() => socials.remove(index)}
                >
                  <Trash1 size={18} />
                </Button>
              </div>
            </div>
          ))}

          <Button
            size="md"
            variant="outline"
            onPress={() => socials.append(createSocialDraft())}
          >
            <Plus size={18} />
            {t("addSocial")}
          </Button>
        </div>
      </div>
    </section>
  );
}
