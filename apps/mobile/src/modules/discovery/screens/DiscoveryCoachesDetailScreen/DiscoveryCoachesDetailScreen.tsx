"use client";

import { useState } from "react";
import { DiscoveryCoachesDetailActionsSection } from "../../sections/DiscoveryCoachesDetailActionsSection";
import { DiscoveryCoachesDetailHeroSection } from "../../sections/DiscoveryCoachesDetailHeroSection";
import { DiscoveryCoachesDetailProgramsSection } from "../../sections/DiscoveryCoachesDetailProgramsSection";
import { discoveryCoachesDetailScreenStyles as styles } from "./DiscoveryCoachesDetailScreen.styles";
import type { DiscoveryCoachesDetailScreenProps } from "./DiscoveryCoachesDetailScreen.types";

export function DiscoveryCoachesDetailScreen({
  coach,
}: DiscoveryCoachesDetailScreenProps) {
  const [doneIds, setDoneIds] = useState(
    () =>
      new Set(coach.programs.filter((program) => program.done).map((p) => p.id)),
  );

  const handleToggleDone = (programId: string) => {
    setDoneIds((current) => {
      const next = new Set(current);
      if (next.has(programId)) {
        next.delete(programId);
      } else {
        next.add(programId);
      }
      return next;
    });
  };

  const programs = coach.programs.map((program) => ({
    ...program,
    done: doneIds.has(program.id),
  }));

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <DiscoveryCoachesDetailHeroSection coach={coach}>
          <DiscoveryCoachesDetailProgramsSection
            onToggleDone={handleToggleDone}
            programs={programs}
          />
        </DiscoveryCoachesDetailHeroSection>
      </div>
      <DiscoveryCoachesDetailActionsSection />
    </div>
  );
}
