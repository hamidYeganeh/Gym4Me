"use client";

import { useEffect, useMemo, useState } from "react";
import type { AthleteProfile } from "@repo/api";
import { TodoCard, type TodoCardItem } from "@repo/ui/cards/TodoCard";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/lib/app-router";
import { accountProfile } from "@/shared/lib/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  buildAthleteSetupTodos,
  type AthleteSetupTodoId,
} from "../../lib/athlete-home-setup";
import { athleteHomeSetupTodoSectionVariants } from "./AthleteHomeSetupTodoSection.styles";
import type { AthleteHomeSetupTodoSectionProps } from "./AthleteHomeSetupTodoSection.types";

const TODO_LABEL_KEYS: Record<
  AthleteSetupTodoId,
  | "todoItemProfile"
  | "todoItemLocation"
  | "todoItemAthleteProfile"
  | "todoItemAvatar"
  | "todoItemVerify"
> = {
  athleteProfile: "todoItemAthleteProfile",
  avatar: "todoItemAvatar",
  location: "todoItemLocation",
  profile: "todoItemProfile",
  verify: "todoItemVerify",
};

export function AthleteHomeSetupTodoSection({
  className,
}: AthleteHomeSetupTodoSectionProps) {
  const t = useTranslations("AthleteHome");
  const styles = athleteHomeSetupTodoSectionVariants();
  const router = useRouter();
  const { isAuthenticated, isReady, user } = useAuth();
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(
    null,
  );
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      setAthleteProfile(null);
      setProfileReady(true);
      return;
    }

    let cancelled = false;
    setProfileReady(false);
    void accountProfile
      .getAthlete()
      .then((profile) => {
        if (!cancelled) setAthleteProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setAthleteProfile(null);
      })
      .finally(() => {
        if (!cancelled) setProfileReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isReady, user?.id]);

  const todos = useMemo(() => {
    if (!user) return [];
    return buildAthleteSetupTodos({ athleteProfile, user });
  }, [athleteProfile, user]);

  const items: TodoCardItem[] = todos.map((todo) => ({
    id: todo.id,
    label: t(TODO_LABEL_KEYS[todo.id]),
    onPress:
      todo.status === "pending"
        ? () => router.push(todo.href)
        : undefined,
    status: todo.status,
  }));

  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;
  const allComplete =
    items.length > 0 && completedCount === items.length;

  if (!profileReady || !user || items.length === 0 || allComplete) {
    return null;
  }

  return (
    <section className={styles.root({ className })}>
      <TodoCard
        items={items}
        progressLabel={t("todoProgressLabel")}
        stepLabel={t("todoStepLabel", {
          current: completedCount,
          total: items.length,
        })}
        title={t("todoTitle")}
      />
    </section>
  );
}
