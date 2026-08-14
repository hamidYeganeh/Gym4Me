import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { releasePoliciesFormSectionVariants } from "./ReleasePoliciesFormSection.styles";
import {
  RELEASE_CHANNELS,
  RELEASE_PLATFORMS,
  type ReleasePoliciesFormSectionProps,
} from "./ReleasePoliciesFormSection.types";

export function ReleasePoliciesFormSection({
  draft,
  isCreate,
  pending,
  error,
  onChange,
  onClose,
  onSave,
}: ReleasePoliciesFormSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = releasePoliciesFormSectionVariants();

  return (
    <AdminFormDrawer
      isOpen={Boolean(draft)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={isCreate ? t("releases.createTitle") : t("releases.editTitle")}
    >
      {draft ? (
        <form
          className={styles.form()}
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <div className={styles.field()}>
            <Select
              isDisabled={!isCreate}
              value={draft.platform}
              onChange={(value) => {
                if (value === "ios" || value === "android" || value === "web") {
                  onChange({ ...draft, platform: value });
                }
              }}
            >
              <Label>{t("releases.fields.platform")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {RELEASE_PLATFORMS.map((item) => (
                    <ListBox.Item id={item} key={item} textValue={item}>
                      {item}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className={styles.field()}>
            <Select
              isDisabled={!isCreate}
              value={draft.channel ?? "production"}
              onChange={(value) => {
                if (
                  value === "production" ||
                  value === "beta" ||
                  value === "development"
                ) {
                  onChange({ ...draft, channel: value });
                }
              }}
            >
              <Label>{t("releases.fields.channel")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {RELEASE_CHANNELS.map((item) => (
                    <ListBox.Item id={item} key={item} textValue={item}>
                      {item}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <TextField className={styles.field()} name="latest" isRequired>
            <Label>{t("releases.fields.latest")}</Label>
            <Input
              dir="ltr"
              value={draft.latestAppVersion}
              onChange={(event) =>
                onChange({ ...draft, latestAppVersion: event.target.value })
              }
            />
          </TextField>
          <TextField className={styles.field()} name="minimum" isRequired>
            <Label>{t("releases.fields.minimum")}</Label>
            <Input
              dir="ltr"
              value={draft.minimumSupportedAppVersion}
              onChange={(event) =>
                onChange({
                  ...draft,
                  minimumSupportedAppVersion: event.target.value,
                })
              }
            />
          </TextField>
          <TextField className={styles.field()} name="api" isRequired>
            <Label>{t("releases.fields.api")}</Label>
            <Input
              dir="ltr"
              value={draft.recommendedApiVersion}
              onChange={(event) =>
                onChange({
                  ...draft,
                  recommendedApiVersion: event.target.value,
                })
              }
            />
          </TextField>
          <TextField className={styles.field()} name="updateUrl">
            <Label>{t("releases.fields.updateUrl")}</Label>
            <Input
              dir="ltr"
              value={draft.updateUrl ?? ""}
              onChange={(event) =>
                onChange({ ...draft, updateUrl: event.target.value })
              }
            />
          </TextField>
          <div className={styles.field()}>
            <Select
              value={draft.enabled ? "on" : "off"}
              onChange={(value) =>
                onChange({ ...draft, enabled: value === "on" })
              }
            >
              <Label>{t("releases.fields.enabled")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="on" textValue="on">
                    on
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="off" textValue="off">
                    off
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <TextField className={styles.field()} name="reason" isRequired>
            <Label>{t("releases.fields.reason")}</Label>
            <Input
              value={draft.reason}
              onChange={(event) =>
                onChange({ ...draft, reason: event.target.value })
              }
            />
          </TextField>
          {error ? (
            <Typography className="text-danger" role="alert">
              {error}
            </Typography>
          ) : null}
          <div className={styles.actions()}>
            <Button
              isDisabled={pending}
              type="button"
              variant="outline"
              onPress={onClose}
            >
              {t("cancel")}
            </Button>
            <Button isDisabled={pending} type="submit" variant="primary">
              {t("save")}
            </Button>
          </div>
        </form>
      ) : null}
    </AdminFormDrawer>
  );
}
