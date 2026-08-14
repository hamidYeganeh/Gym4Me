import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import type { FeatureFlagStatus } from "@repo/api";
import { useTranslations } from "next-intl";
import { AdminFormDrawer } from "@/shared/components";
import { featureFlagsEditSectionVariants } from "./FeatureFlagsEditSection.styles";
import type { FeatureFlagsEditSectionProps } from "./FeatureFlagsEditSection.types";

const FEATURE_FLAG_STATUSES: FeatureFlagStatus[] = [
  "draft",
  "active",
  "paused",
  "archived",
];

export function FeatureFlagsEditSection({
  flag,
  pending,
  error,
  onClose,
  onSave,
}: FeatureFlagsEditSectionProps) {
  const t = useTranslations("Admin.Ops");
  const styles = featureFlagsEditSectionVariants();
  const [status, setStatus] = useState<FeatureFlagStatus>("active");
  const [rollout, setRollout] = useState("100");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!flag) return;
    setStatus(flag.status);
    setRollout(String(flag.rolloutPercentage));
    setReason("");
  }, [flag]);

  return (
    <AdminFormDrawer
      isOpen={Boolean(flag)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t("flags.editTitle")}
    >
      {flag ? (
        <form
          className={styles.form()}
          onSubmit={(event) => {
            event.preventDefault();
            void onSave({
              status,
              rolloutPercentage: Math.min(
                100,
                Math.max(0, Number(rollout) || 0),
              ),
              reason,
            });
          }}
        >
          <Typography dir="ltr">{flag.key}</Typography>
          <div className={styles.field()}>
            <Select
              value={status}
              onChange={(value) => {
                if (
                  value === "draft" ||
                  value === "active" ||
                  value === "paused" ||
                  value === "archived"
                ) {
                  setStatus(value);
                }
              }}
            >
              <Label>{t("flags.fields.status")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {FEATURE_FLAG_STATUSES.map((item) => (
                    <ListBox.Item
                      id={item}
                      key={item}
                      textValue={t(`flags.status.${item}`)}
                    >
                      {t(`flags.status.${item}`)}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <TextField className={styles.field()} name="rollout">
            <Label>{t("flags.fields.rollout")}</Label>
            <Input
              dir="ltr"
              inputMode="numeric"
              value={rollout}
              onChange={(event) => setRollout(event.target.value)}
            />
          </TextField>
          <TextField className={styles.field()} name="reason" isRequired>
            <Label>{t("flags.fields.reason")}</Label>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
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
