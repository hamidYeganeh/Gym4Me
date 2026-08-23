"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OwnerBroadcastScreen } from "../screens/OwnerBroadcastScreen";
import type { OwnerBroadcastForm } from "../screens/OwnerBroadcastScreen/OwnerBroadcastScreen.types";
import {
  OWNER_BROADCASTS,
  type OwnerBroadcastEntry,
} from "./owner-broadcast-data";

export function OwnerBroadcastGate() {
  const [broadcasts, setBroadcasts] = useState(
    DEMO_MODE ? OWNER_BROADCASTS : [],
  );
  const [form, setForm] = useState<OwnerBroadcastForm>({
    title: "",
    body: "",
    audience: "all",
  });
  const [pending, setPending] = useState(false);

  const handleSend = () => {
    setPending(true);
    setTimeout(() => {
      const next: OwnerBroadcastEntry = {
        id: `bc-${Date.now()}`,
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        sentAtLabel: "همین الان",
        recipientCount:
          form.audience === "all"
            ? 890
            : form.audience === "active_members"
              ? 312
              : 48,
      };
      setBroadcasts((previous) => [next, ...previous]);
      setForm({ title: "", body: "", audience: "all" });
      setPending(false);
    }, 400);
  };

  return (
    <OwnerBroadcastScreen
      broadcasts={broadcasts}
      form={form}
      onFormChange={(patch) =>
        setForm((previous) => ({ ...previous, ...patch }))
      }
      onSend={DEMO_MODE ? handleSend : undefined}
      pending={pending}
    />
  );
}
