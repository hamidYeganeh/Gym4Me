import { Typography } from "@heroui/react/typography";
import { ProfileMenuRow } from "@/modules/account/components/ProfileMenuRow";
import { baseProfileMenuSectionVariants } from "./BaseProfileMenuSection.styles";
import type { BaseProfileMenuSectionProps } from "./BaseProfileMenuSection.types";

export function BaseProfileMenuSection({
  groups,
  className,
}: BaseProfileMenuSectionProps) {
  const styles = baseProfileMenuSectionVariants();

  return (
    <div className={styles.root({ className })} id="profile-settings">
      {groups.map((group) =>
        group.items.length === 0 ? null : (
          <section className={styles.group()} key={group.key}>
            <Typography className={styles.groupTitle()} type="body-sm">
              {group.title}
            </Typography>
            <div className={styles.stack()}>
              {group.items.map((item) => (
                <ProfileMenuRow
                  badge={item.badge}
                  hint={item.hint}
                  icon={item.icon}
                  isDisabled={item.isDisabled}
                  key={item.key}
                  label={item.label}
                  onPress={item.onPress}
                  showChevron={item.showChevron}
                  tone={item.tone}
                  trailing={item.trailing}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
