"use client";

import { useState } from "react";
import { OwnerCoachesScreen } from "../screens/OwnerCoachesScreen";
import type { OwnerCoachInviteForm } from "../screens/OwnerCoachesScreen/OwnerCoachesScreen.types";
import { OWNER_COACHES, type OwnerCoachAffiliation } from "./owner-coaches-data";

export function OwnerCoachesGate() {
  const [coaches, setCoaches] = useState(OWNER_COACHES);
  const [form, setForm] = useState<OwnerCoachInviteForm>({
    name: "",
    branchLabel: "",
    commissionPercent: "",
  });
  const [pending, setPending] = useState(false);

  const handleInvite = () => {
    setPending(true);
    setTimeout(() => {
      const next: OwnerCoachAffiliation = {
        id: `coach-${Date.now()}`,
        name: form.name.trim(),
        branchLabel: form.branchLabel.trim(),
        commissionPercent: Number(form.commissionPercent) || 0,
        status: "invited",
        specialties: [],
      };
      setCoaches((previous) => [next, ...previous]);
      setForm({ name: "", branchLabel: "", commissionPercent: "" });
      setPending(false);
    }, 400);
  };

  return (
    <OwnerCoachesScreen
      coaches={coaches}
      form={form}
      onFormChange={(patch) => setForm((previous) => ({ ...previous, ...patch }))}
      onInvite={handleInvite}
      pending={pending}
    />
  );
}
