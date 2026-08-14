"use client";

import { Spinner } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { CoachLeadsScreen } from "../screens/CoachLeadsScreen";
import {
  COACH_LEADS,
  type CoachLead,
  type CoachLeadStage,
} from "./coach-leads-data";

export function CoachLeadsGate() {
  const { isReady } = useAuth();
  const [leads, setLeads] = useState<CoachLead[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    setLeads(COACH_LEADS);
  }, [isReady]);

  const onChangeStage = useCallback(
    async (leadId: string, stage: CoachLeadStage) => {
      setUpdatingId(leadId);
      try {
        setLeads((current) =>
          (current ?? []).map((lead) =>
            lead.id === leadId
              ? { ...lead, stage, updatedLabel: "به‌روزرسانی همین الان" }
              : lead,
          ),
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  if (!leads) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <CoachLeadsScreen
      leads={leads}
      onChangeStage={onChangeStage}
      updatingId={updatingId}
    />
  );
}
