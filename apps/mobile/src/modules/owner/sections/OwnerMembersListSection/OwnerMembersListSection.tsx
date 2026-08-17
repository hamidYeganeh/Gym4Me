import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { CheckCircle } from "@repo/icons/CheckCircle";
import { FilterChip, FilterChipBar } from "@repo/ui/kit/FilterChip";
import Image from "next/image";
import type { OwnerMembershipState } from "@/modules/owner/lib/owner-members-data";
import { ownerMembersListSectionVariants } from "./OwnerMembersListSection.styles";
import type { OwnerMembersListSectionProps } from "./OwnerMembersListSection.types";

const STATE_CHIP_COLOR: Record<
  OwnerMembershipState,
  "success" | "warning" | "accent" | "danger"
> = {
  active: "success",
  expiring: "warning",
  frozen: "accent",
  expired: "danger",
};

export function OwnerMembersListSection({
  query,
  setQuery,
  activeFilter,
  setActiveFilter,
  checkedInIds,
  pendingId,
  filteredMembers,
  toggleCheckIn,
  pending,
  filters,
  searchLabel,
  searchPlaceholder,
  filtersLabel,
  listLabel,
  sessionsLabel,
  checkedInChip,
  emptyTitle,
  emptyBody,
  stateLabels,
  checkInAction,
  unfreezeAction,
  freezeAction,
  onFreeze,
  onUnfreeze,
  className,
}: OwnerMembersListSectionProps) {
  const styles = ownerMembersListSectionVariants();

  return (
    <div className={className}>
      <TextField className={styles.search()}>
        <Label>{searchLabel}</Label>
        <Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          value={query}
        />
      </TextField>

      <FilterChipBar aria-label={filtersLabel}>
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            selected={activeFilter === filter.id}
          >
            {filter.label}
          </FilterChip>
        ))}
      </FilterChipBar>

      {filteredMembers.length > 0 ? (
        <div aria-label={listLabel} className={styles.groupCard()}>
          {filteredMembers.map((member, index) => {
            const isCheckedIn = checkedInIds.has(member.id);
            const fillPercent = Math.min(
              Math.round((member.sessionsUsed / member.sessionsTotal) * 100),
              100,
            );

            return (
              <div key={member.id}>
                <div className={styles.row()}>
                  <Image
                    alt={member.name}
                    className={styles.avatar()}
                    height={44}
                    src={member.avatar}
                    width={44}
                  />
                  <div className={styles.rowBody()}>
                    <div className={styles.rowTop()}>
                      <Typography
                        className={styles.rowName()}
                        type="body"
                        weight="semibold"
                      >
                        {member.name}
                      </Typography>
                      <Chip
                        color={STATE_CHIP_COLOR[member.membershipState]}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {stateLabels[member.membershipState]}
                        </Chip.Label>
                      </Chip>
                      {isCheckedIn ? (
                        <Chip color="success" size="sm" variant="soft">
                          <Chip.Label>{checkedInChip}</Chip.Label>
                        </Chip>
                      ) : null}
                    </div>
                    <Typography className={styles.rowPlan()} type="body-sm">
                      {member.planName}
                    </Typography>
                    <Typography className={styles.rowMeta()} type="body-sm">
                      {member.lastCheckInLabel}
                    </Typography>
                    <div className={styles.progress()}>
                      <div className={styles.progressRow()}>
                        <Typography
                          className={styles.progressLabel()}
                          type="body-sm"
                        >
                          {sessionsLabel}
                        </Typography>
                        <span className={styles.progressValue()}>
                          {member.sessionsUsed}/{member.sessionsTotal}
                        </span>
                      </div>
                      <span aria-hidden className={styles.progressTrack()}>
                        <span
                          className={styles.progressFill()}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowEnd()}>
                    <Button
                      aria-label={checkInAction({ name: member.name })}
                      isDisabled={Boolean(pendingId) || pending}
                      isIconOnly
                      onPress={() => {
                        void toggleCheckIn(member);
                      }}
                      size="lg"
                      variant="ghost"
                    >
                      <CheckCircle
                        className={
                          isCheckedIn ? "text-success" : "text-muted"
                        }
                        size={22}
                      />
                    </Button>
                    {member.membershipState === "frozen" && onUnfreeze ? (
                      <Button
                        isDisabled={pending}
                        onPress={() => {
                          void onUnfreeze(member);
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        {unfreezeAction}
                      </Button>
                    ) : null}
                    {member.membershipState !== "frozen" &&
                    member.membershipState !== "expired" &&
                    onFreeze ? (
                      <Button
                        isDisabled={pending}
                        onPress={() => {
                          void onFreeze(member);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        {freezeAction}
                      </Button>
                    ) : null}
                  </div>
                </div>
                {index < filteredMembers.length - 1 ? (
                  <div aria-hidden className={styles.divider()} />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty()}>
          <Typography
            className={styles.emptyTitle()}
            type="h4"
            weight="semibold"
          >
            {emptyTitle}
          </Typography>
          <Typography className={styles.emptyBody()} type="body-sm">
            {emptyBody}
          </Typography>
        </div>
      )}
    </div>
  );
}
