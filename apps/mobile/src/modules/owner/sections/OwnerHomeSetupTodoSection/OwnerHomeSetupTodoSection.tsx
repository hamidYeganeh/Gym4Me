"use client";

import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { useTranslations } from "next-intl";
import { ownerHomeSetupTodoSectionVariants } from "./OwnerHomeSetupTodoSection.styles";
import type { OwnerHomeSetupTodoSectionProps } from "./OwnerHomeSetupTodoSection.types";

export function OwnerHomeSetupTodoSection({
  onFirstClassPress,
}: OwnerHomeSetupTodoSectionProps) {
  const t = useTranslations("OwnerHome");
  const styles = ownerHomeSetupTodoSectionVariants();

  const setupItems: TodoCardItem[] = [
    {
      id: "club-profile",
      label: t("todoItemClubProfile"),
      status: "completed",
    },
    {
      id: "staff",
      label: t("todoItemStaff"),
      status: "completed",
    },
    {
      id: "verify",
      label: t("todoItemVerify"),
      status: "completed",
    },
    {
      id: "first-class",
      label: t("todoItemFirstClass"),
      status: "pending",
      onPress: onFirstClassPress,
    },
  ];
  const completedCount = setupItems.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <section className={styles.root()}>
      <TodoCard
        items={setupItems}
        progressLabel={t("todoProgressLabel")}
        stepLabel={t("todoStepLabel", {
          current: completedCount,
          total: setupItems.length,
        })}
        title={t("todoTitle")}
      />
    </section>
  );
}
