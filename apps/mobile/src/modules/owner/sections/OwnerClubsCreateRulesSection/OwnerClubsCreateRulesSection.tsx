"use client";

import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { Trash1 } from "@repo/icons/Trash1";
import { FilterChip } from "@repo/ui/kit/FilterChip";
import { useTranslations } from "next-intl";
import { ownerClubsCreateRulesSectionVariants } from "./OwnerClubsCreateRulesSection.styles";
import type { OwnerClubsCreateRulesSectionProps } from "./OwnerClubsCreateRulesSection.types";

export function OwnerClubsCreateRulesSection({
  rules,
  onAddRule,
  onRemoveRule,
  onRuleChange,
  className,
}: OwnerClubsCreateRulesSectionProps) {
  const t = useTranslations("Mobile.ClubCreate");
  const styles = ownerClubsCreateRulesSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="bold">
          {t("stepRules")}
        </Typography>
        <Typography className={styles.hint()} type="body-sm">
          {t("stepRulesHint")}
        </Typography>
      </div>

      {rules.length === 0 ? (
        <Typography className={styles.empty()} type="body-sm">
          {t("noRules")}
        </Typography>
      ) : (
        <div className={styles.list()}>
          {rules.map((rule) => (
            <div className={styles.ruleCard()} key={rule.id}>
              <div className={styles.chips()}>
                <FilterChip
                  selected={rule.policy === "forbidden"}
                  onPress={() => onRuleChange(rule.id, { policy: "forbidden" })}
                >
                  {t("ruleForbidden")}
                </FilterChip>
                <FilterChip
                  selected={rule.policy === "allowed"}
                  onPress={() => onRuleChange(rule.id, { policy: "allowed" })}
                >
                  {t("ruleAllowed")}
                </FilterChip>
              </div>

              <TextField
                className={styles.field()}
                fullWidth
                name={`rule-title-${rule.id}`}
                value={rule.title}
                onChange={(value) => onRuleChange(rule.id, { title: value })}
              >
                <Label>{t("ruleTitle")}</Label>
                <Input placeholder={t("ruleTitlePlaceholder")} />
              </TextField>

              <TextField
                className={styles.field()}
                fullWidth
                name={`rule-description-${rule.id}`}
                value={rule.description}
                onChange={(value) =>
                  onRuleChange(rule.id, { description: value })
                }
              >
                <Label>{t("ruleDescription")}</Label>
                <Input placeholder={t("ruleDescriptionPlaceholder")} />
              </TextField>

              <Button
                aria-label={t("removeRule")}
                className={styles.removeButton()}
                fullWidth
                size="lg"
                variant="danger"
                onPress={() => onRemoveRule(rule.id)}
              >
                <Trash1 size={18} />
                {t("removeRule")}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button fullWidth size="lg" variant="outline" onPress={onAddRule}>
        <Plus size={18} />
        {t("addRule")}
      </Button>
    </section>
  );
}
