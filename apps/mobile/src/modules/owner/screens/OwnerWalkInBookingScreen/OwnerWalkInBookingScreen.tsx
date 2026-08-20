"use client";

import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { ChevronLeft } from "@repo/icons/ChevronLeft";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";

import type {
  OwnerWalkInMemberType,
  OwnerWalkInResourceType,
} from "../../lib/owner-walk-in-booking-data";
import { ownerWalkInBookingScreenVariants } from "./OwnerWalkInBookingScreen.styles";
import type { OwnerWalkInBookingScreenProps } from "./OwnerWalkInBookingScreen.types";

const RESOURCE_KEY: Record<
  OwnerWalkInResourceType,
  "resourceClass" | "resourceSlot" | "resourceCoach"
> = {
  class: "resourceClass",
  slot: "resourceSlot",
  coach: "resourceCoach",
};

export function OwnerWalkInBookingScreen({
  bookings,
  form,
  pending = false,
  onFormChange,
  onSubmit,
  className,
}: OwnerWalkInBookingScreenProps) {
  const t = useTranslations("OwnerWalkInBooking");
  const router = useRouter();
  const styles = ownerWalkInBookingScreenVariants();

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

        <section className={styles.formCard()}>
          <Typography type="body" weight="semibold">
            {t("formTitle")}
          </Typography>
          <TextField>
            <Label>{t("memberTypeLabel")}</Label>
            <select
              className={styles.select()}
              onChange={(event) =>
                onFormChange({
                  memberOrGuest: event.target.value as OwnerWalkInMemberType,
                })
              }
              value={form.memberOrGuest}
            >
              <option value="member">{t("typeMember")}</option>
              <option value="guest">{t("typeGuest")}</option>
            </select>
          </TextField>
          <TextField>
            <Label>{t("nameLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ name: event.target.value })}
              value={form.name}
            />
          </TextField>
          <TextField>
            <Label>{t("phoneLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ phone: event.target.value })}
              value={form.phone}
            />
          </TextField>
          <TextField>
            <Label>{t("resourceTypeLabel")}</Label>
            <select
              className={styles.select()}
              onChange={(event) =>
                onFormChange({
                  resourceType: event.target.value as OwnerWalkInResourceType,
                })
              }
              value={form.resourceType}
            >
              <option value="class">{t("resourceClass")}</option>
              <option value="slot">{t("resourceSlot")}</option>
              <option value="coach">{t("resourceCoach")}</option>
            </select>
          </TextField>
          <TextField>
            <Label>{t("datetimeLabel")}</Label>
            <Input
              onChange={(event) =>
                onFormChange({ datetime: event.target.value })
              }
              placeholder={t("datetimePlaceholder")}
              value={form.datetime}
            />
          </TextField>
          <TextField>
            <Label>{t("notesLabel")}</Label>
            <Input
              onChange={(event) => onFormChange({ notes: event.target.value })}
              value={form.notes}
            />
          </TextField>
          <Button
            isDisabled={
              pending ||
              !onSubmit ||
              !form.name.trim() ||
              !form.phone.trim() ||
              !form.datetime.trim()
            }
            isPending={pending}
            onPress={onSubmit}
            size="lg"
            variant="primary"
          >
            {t("submit")}
          </Button>
        </section>

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("listTitle")}
          </Typography>
          {bookings.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {bookings.map((booking, index) => (
                <div key={booking.id}>
                  <div className={styles.row()}>
                    <Typography className={styles.rowLabel()} type="body" weight="semibold">
                      {booking.name}
                    </Typography>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {booking.memberOrGuest === "member" ? t("typeMember") : t("typeGuest")} · {booking.phone}
                    </Typography>
                    <Typography className={styles.rowHint()} type="body-sm">
                      {t(RESOURCE_KEY[booking.resourceType])}: {booking.resourceLabel} · {booking.datetimeLabel}
                    </Typography>
                    {booking.notes ? (
                      <Typography className={styles.rowHint()} type="body-sm">
                        {booking.notes}
                      </Typography>
                    ) : null}
                  </div>
                  {index < bookings.length - 1 ? (
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
