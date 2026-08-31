"use client";

import type { ReactNode } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Globe } from "@repo/icons/Globe";
import { LogoInstagram } from "@repo/icons/LogoInstagram";
import { LogoTelegram } from "@repo/icons/LogoTelegram";
import { LogoWhatsapp } from "@repo/icons/LogoWhatsapp";
import { LogoX } from "@repo/icons/LogoX";
import { Plus } from "@repo/icons/Plus";
import { Trash1 } from "@repo/icons/Trash1";
import { PhoneField } from "@repo/ui/kit/PhoneField";
import { useTranslations } from "next-intl";
import {
  createPhoneDraft,
  createSocialDraft,
  SOCIAL_PLATFORM_OPTIONS,
} from "../../lib/club-create-form";
import { ownerClubsCreateContactSectionVariants } from "./OwnerClubsCreateContactSection.styles";
import type { OwnerClubsCreateContactSectionProps } from "./OwnerClubsCreateContactSection.types";

const PLATFORM_ICON_SIZE = 20;

type SocialPlatform = (typeof SOCIAL_PLATFORM_OPTIONS)[number];

function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORM_OPTIONS as readonly string[]).includes(value);
}

function SocialPlatformIcon({
  platform,
  size = PLATFORM_ICON_SIZE,
}: {
  platform: string;
  size?: number;
}): ReactNode {
  if (!isSocialPlatform(platform)) {
    return <Globe size={size} />;
  }

  switch (platform) {
    case "instagram":
      return <LogoInstagram size={size} />;
    case "telegram":
      return <LogoTelegram size={size} />;
    case "whatsapp":
      return <LogoWhatsapp size={size} />;
    case "website":
      return <Globe size={size} />;
    case "x":
      return <LogoX size={size} />;
  }
}

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
                    <PhoneField
                      className={styles.phoneField()}
                      countryCode="+98"
                      inputRef={phoneField.ref}
                      label={t("phone")}
                      name={phoneField.name}
                      placeholder={t("phonePlaceholder")}
                      showCountryChevron
                      value={phoneField.value}
                      onBlur={phoneField.onBlur}
                      onChange={phoneField.onChange}
                    />
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
            className={styles.addButton()}
            fullWidth
            size="lg"
            variant="outline"
            onPress={() => phones.append(createPhoneDraft())}
          >
            <Plus size={18} />
            {t("addPhone")}
          </Button>
        </div>

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
                  render={({ field: platformField }) => {
                    const platform = platformField.value || "instagram";
                    const platformName = isSocialPlatform(platform)
                      ? t(`socialPlatforms.${platform}`)
                      : t("socialPlatform");

                    return (
                      <Select
                        aria-label={platformName}
                        className={styles.platformField()}
                        fullWidth
                        placeholder={t("socialPlatform")}
                        value={platformField.value || null}
                        onChange={(value) =>
                          platformField.onChange(String(value ?? "instagram"))
                        }
                      >
                        <Label className={styles.platformLabel()}>
                          <span aria-hidden>
                            <SocialPlatformIcon platform={platform} />
                          </span>
                          <span className="sr-only">{platformName}</span>
                        </Label>
                        <Select.Trigger className={styles.platformTrigger()}>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                              <ListBox.Item
                                key={option}
                                id={option}
                                textValue={t(`socialPlatforms.${option}`)}
                              >
                                <span className={styles.platformOption()}>
                                  <SocialPlatformIcon platform={option} />
                                  {t(`socialPlatforms.${option}`)}
                                </span>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    );
                  }}
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
            className={styles.addButton()}
            fullWidth
            size="lg"
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
