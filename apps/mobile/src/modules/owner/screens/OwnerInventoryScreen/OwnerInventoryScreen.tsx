"use client";

import { Chip } from "@heroui/react/chip";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { Typography } from "@heroui/react/typography";
import { AppLayout } from "@repo/ui/layout/AppLayout";
import { SecondaryPageHeader } from "@repo/ui/layout/SecondaryPageHeader";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "@/shared/lib/app-router";

import type { OwnerInventoryCondition } from "../../lib/owner-inventory-data";
import { ownerInventoryScreenVariants } from "./OwnerInventoryScreen.styles";
import type {
  OwnerInventoryCreateForm,
  OwnerInventoryScreenProps,
} from "./OwnerInventoryScreen.types";

const createSchema = z.object({
  name: z.string().trim().min(2).max(160),
  quantity: z.number().int().min(0).max(100_000),
  locationLabel: z.string().trim().max(160),
});

const CONDITION_COLOR: Record<
  OwnerInventoryCondition,
  "success" | "warning" | "danger"
> = {
  good: "success",
  needs_repair: "warning",
  out_of_service: "danger",
};

const CONDITION_KEY = {
  good: "conditionGood",
  needs_repair: "conditionNeedsRepair",
  out_of_service: "conditionOutOfService",
} as const;

export function OwnerInventoryScreen({
  items,
  pendingId,
  onConditionChange,
  onCreate,
  className,
}: OwnerInventoryScreenProps) {
  const t = useTranslations("OwnerInventory");
  const router = useRouter();
  const styles = ownerInventoryScreenVariants();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<OwnerInventoryCreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", quantity: 1, locationLabel: "" },
  });

  const submitCreate = handleSubmit(async (form) => {
    if (!onCreate) return;
    await onCreate(form);
    reset();
  });

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

        {onCreate ? (
          <form
            className="flex flex-col gap-3 rounded-[24px] bg-surface p-4"
            onSubmit={(event) => void submitCreate(event)}
          >
            <Typography type="h4" weight="semibold">
              {t("createTitle")}
            </Typography>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField isInvalid={Boolean(errors.name)}>
                  <Label>{t("nameLabel")}</Label>
                  <Input {...field} />
                  {errors.name ? (
                    <span className="text-danger" role="alert">
                      {t("nameError")}
                    </span>
                  ) : null}
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <TextField isInvalid={Boolean(errors.quantity)}>
                  <Label>{t("quantityLabel")}</Label>
                  <Input
                    inputMode="numeric"
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    ref={field.ref}
                    value={String(field.value)}
                  />
                  {errors.quantity ? (
                    <span className="text-danger" role="alert">
                      {t("quantityError")}
                    </span>
                  ) : null}
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="locationLabel"
              render={({ field }) => (
                <TextField>
                  <Label>{t("locationLabel")}</Label>
                  <Input {...field} />
                </TextField>
              )}
            />
            <Button
              isDisabled={isSubmitting}
              isPending={isSubmitting}
              type="submit"
              variant="primary"
             size="lg">
              {t("createSubmit")}
            </Button>
          </form>
        ) : null}

        <section className={styles.section()}>
          <Typography className={styles.sectionTitle()} type="h4" weight="semibold">
            {t("listTitle")}
          </Typography>
          {items.length === 0 ? (
            <div className={styles.empty()}>{t("empty")}</div>
          ) : (
            <div className={styles.card()}>
              {items.map((item, index) => (
                <div key={item.id}>
                  <div className={styles.row()}>
                    <span className={styles.rowBody()}>
                      <Typography className={styles.rowLabel()} type="body" weight="semibold">
                        {item.name}
                      </Typography>
                      <Typography className={styles.rowHint()} type="body-sm">
                        {t("quantity", { count: item.quantity })} · {item.locationLabel}
                      </Typography>
                    </span>
                    <Chip
                      color={CONDITION_COLOR[item.condition]}
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>{t(CONDITION_KEY[item.condition])}</Chip.Label>
                    </Chip>
                  </div>
                  {onConditionChange ? (
                    <div className="flex flex-wrap justify-end gap-2 px-4 pb-3">
                      {(
                        [
                          "good",
                          "needs_repair",
                          "out_of_service",
                        ] as const
                      ).map((condition) => (
                        <Button
                          isDisabled={Boolean(pendingId)}
                          isPending={pendingId === item.id && item.condition !== condition}
                          key={condition}
                          onPress={() => onConditionChange(item, condition)}
                          size="lg"
                          variant={item.condition === condition ? "primary" : "secondary"}
                        >
                          {t(CONDITION_KEY[condition])}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  {index < items.length - 1 ? (
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
