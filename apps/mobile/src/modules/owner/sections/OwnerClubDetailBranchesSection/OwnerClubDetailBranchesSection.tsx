import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { Plus } from "@repo/icons/Plus";
import { ownerClubDetailBranchesSectionVariants } from "./OwnerClubDetailBranchesSection.styles";
import type { OwnerClubDetailBranchesSectionProps } from "./OwnerClubDetailBranchesSection.types";

export function OwnerClubDetailBranchesSection({
  title,
  addBranchLabel,
  branches,
  activeStateLabel,
  maintenanceStateLabel,
  className,
}: OwnerClubDetailBranchesSectionProps) {
  const styles = ownerClubDetailBranchesSectionVariants();

  return (
    <section className={styles.root({ className })}>
      <div className={styles.header()}>
        <Typography className={styles.title()} type="h4" weight="semibold">
          {title}
        </Typography>
        <Button size="lg" variant="ghost">
          <Plus aria-hidden size={16} />
          {addBranchLabel}
        </Button>
      </div>
      <div className={styles.groupCard()}>
        {branches.map((branch, index) => (
          <div key={branch.id}>
            <div className={styles.row()}>
              <span className={styles.rowBody()}>
                <Typography
                  className={styles.rowLabel()}
                  type="body"
                  weight="medium"
                >
                  {branch.name}
                </Typography>
                <Typography className={styles.rowHint()} type="body-sm">
                  {branch.address}
                </Typography>
                <Typography className={styles.rowHint()} type="body-sm">
                  {branch.capacityLabel}
                </Typography>
              </span>
              <Chip
                color={branch.state === "active" ? "success" : "warning"}
                size="sm"
                variant="soft"
              >
                <Chip.Label>
                  {branch.state === "active"
                    ? activeStateLabel
                    : maintenanceStateLabel}
                </Chip.Label>
              </Chip>
            </div>
            {index < branches.length - 1 ? (
              <div aria-hidden className={styles.divider()} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
