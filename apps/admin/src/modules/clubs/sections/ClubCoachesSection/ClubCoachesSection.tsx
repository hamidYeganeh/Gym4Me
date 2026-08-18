"use client";

import { useState } from "react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Typography } from "@heroui/react/typography";
import { useTranslations } from "next-intl";
import {
  assignClubCoach,
  unassignClubCoach,
} from "../../lib/clubs-repository";
import { clubCoachesSectionVariants } from "./ClubCoachesSection.styles";
import type { ClubCoachesSectionProps } from "./ClubCoachesSection.types";

function coachLabel(coach: ClubCoachesSectionProps["coaches"][number]) {
  const name = [coach.name?.first, coach.name?.last].filter(Boolean).join(" ");
  return name || coach.coachId;
}

export function ClubCoachesSection({
  clubId,
  coaches,
  onChanged,
}: ClubCoachesSectionProps) {
  const t = useTranslations("Admin.Clubs");
  const styles = clubCoachesSectionVariants();
  const [coachId, setCoachId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = async () => {
    const id = coachId.trim();
    if (!id) return;
    setPending(true);
    setError(null);
    try {
      await assignClubCoach(clubId, id);
      setCoachId("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("detail.coachAssignError"));
    } finally {
      setPending(false);
    }
  };

  const unassign = async (id: string) => {
    setPending(true);
    setError(null);
    try {
      await unassignClubCoach(clubId, id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("detail.coachAssignError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.root()}>
      <Typography className={styles.title()}>{t("detail.coaches")}</Typography>

      <div className={styles.formRow()}>
        <Input
          className="flex-1"
          placeholder={t("detail.coachIdPlaceholder")}
          value={coachId}
          onChange={(e) => setCoachId(e.target.value)}
        />
        <Button
          isDisabled={pending || !coachId.trim()}
          size="sm"
          variant="primary"
          onPress={() => void assign()}
        >
          {t("detail.assignCoach")}
        </Button>
      </div>

      {error ? (
        <Typography className={styles.error()} role="alert">
          {error}
        </Typography>
      ) : null}

      {coaches.length ? (
        <ul className={styles.list()}>
          {coaches.map((c) => (
            <li key={c.coachId} className={styles.item()}>
              <span className={styles.itemLabel()}>{coachLabel(c)}</span>
              <span className={styles.itemId()} dir="ltr">
                {c.coachId}
              </span>
              <Button
                isDisabled={pending}
                size="sm"
                variant="danger"
                onPress={() => void unassign(c.coachId)}
              >
                {t("detail.unassignCoach")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Typography className={styles.empty()}>{t("detail.emptyRefs")}</Typography>
      )}
    </div>
  );
}
