import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { Trash2 } from "@repo/icons/Trash2";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { releasePoliciesFormSectionVariants } from "./ReleasePoliciesFormSection.styles";
import {
  RELEASE_CHANNELS,
  RELEASE_PLATFORMS,
  type ReleasePoliciesFormSectionProps,
} from "./ReleasePoliciesFormSection.types";

const MAX_FEATURES = 8;

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

  const notes = draft?.releaseNotes ?? { title: "", features: [""] };
  const features = notes.features.length > 0 ? notes.features : [""];

  const setNotes = (next: { title: string; features: string[] }) => {
    if (!draft) return;
    onChange({ ...draft, releaseNotes: next });
  };

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
            <div className={styles.notesHeader()}>
              <Typography weight="semibold">
                {t("releases.fields.whatsNew")}
              </Typography>
              <Button
                isDisabled={features.length >= MAX_FEATURES}
                size="sm"
                type="button"
                variant="outline"
                onPress={() =>
                  setNotes({
                    title: notes.title,
                    features: [...features, ""],
                  })
                }
              >
                <Plus size={16} />
                {t("releases.fields.addFeature")}
              </Button>
            </div>
            <TextField name="notesTitle">
              <Label>{t("releases.fields.notesTitle")}</Label>
              <Input
                maxLength={120}
                value={notes.title}
                onChange={(event) =>
                  setNotes({ title: event.target.value, features })
                }
              />
            </TextField>
            <div className={styles.featuresList()}>
              {features.map((feature, index) => (
                <div className={styles.featureRow()} key={`feature-${index}`}>
                  <TextField className="flex-1" name={`feature-${index}`}>
                    <Label>
                      {t("releases.fields.featureItem", { index: index + 1 })}
                    </Label>
                    <Input
                      maxLength={120}
                      value={feature}
                      onChange={(event) => {
                        const next = [...features];
                        next[index] = event.target.value;
                        setNotes({ title: notes.title, features: next });
                      }}
                    />
                  </TextField>
                  <Button
                    aria-label={t("releases.fields.removeFeature")}
                    isDisabled={features.length <= 1}
                    isIconOnly
                    size="lg"
                    type="button"
                    variant="ghost"
                    onPress={() => {
                      const next = features.filter((_, i) => i !== index);
                      setNotes({
                        title: notes.title,
                        features: next.length > 0 ? next : [""],
                      });
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

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
