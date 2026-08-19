"use client";

import { Button } from "@heroui/react/button";
import { Chip } from "@heroui/react/chip";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { OwnerLeaveStatus } from "../../lib/owner-shifts-data";
import { ownerShiftsScreenVariants } from "./OwnerShiftsScreen.styles";
import type { OwnerShiftsScreenProps } from "./OwnerShiftsScreen.types";

const LEAVE_COLOR: Record<
  OwnerLeaveStatus,
  "success" | "warning" | "danger"
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const LEAVE_KEY = {
  pending: "leavePending",
  approved: "leaveApproved",
  rejected: "leaveRejected",
} as const;

export function OwnerShiftsScreen({
  shifts,
  leaveRequests,
  pendingId,
  onApprove,
  onReject,
  className,
}: OwnerShiftsScreenProps) {
  const t = useTranslations("OwnerShifts");
  const router = useRouter();
  const styles = ownerShiftsScreenVariants();

  return (
    <AppLayout
      className={[styles.root(), className].filter(Boolean).join(" ")}
      header={
        <SecondaryPageHeader
          backAriaLabel={t("back")}
          onBack={() => router.back()}
        />
      }
    >
      <div className={styles.content()}>
        <section className={styles.intro()}>
          <Typography className={styles.introTitle()} type="h1" weight="bold">
            {t("title")}
          </Typography>
          <Typography className={styles.introSubtitle()} type="body">
            {t("subtitle")}
          </Typography>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("shiftsTitle")}
          </Typography>
          {shifts.length === 0 ? (
            <div className={styles.empty()}>{t("shiftsEmpty")}</div>
          ) : (
            <div className={styles.card()}>
              {shifts.map((shift, index) => (
                <div key={shift.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {shift.staffName}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {shift.dateLabel} · {shift.timeLabel}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {shift.branchLabel}
                      </Typography>
                    </span>
                  </div>
                  {index < shifts.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("leaveTitle")}
          </Typography>
          {leaveRequests.length === 0 ? (
            <div className={styles.empty()}>{t("leaveEmpty")}</div>
          ) : (
            <div className={styles.card()}>
              {leaveRequests.map((request, index) => (
                <div key={request.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {request.staffName}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {request.fromLabel} – {request.toLabel}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {request.reason}
                      </Typography>
                    </span>
                    <span className={styles.rowActions()}>
                      <Chip
                        color={LEAVE_COLOR[request.status]}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>{t(LEAVE_KEY[request.status])}</Chip.Label>
                      </Chip>
                      {request.status === "pending" ? (
                        <>
                          <Button
                            isDisabled={pendingId === request.id}
                            onPress={() => onApprove?.(request)}
                            size="sm"
                            variant="primary"
                          >
                            {t("approve")}
                          </Button>
                          <Button
                            isDisabled={pendingId === request.id}
                            onPress={() => onReject?.(request)}
                            size="sm"
                            variant="outline"
                          >
                            {t("reject")}
                          </Button>
                        </>
                      ) : null}
                    </span>
                  </div>
                  {index < leaveRequests.length - 1 ? (
                    <div aria-hidden className={styles.divider()} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
