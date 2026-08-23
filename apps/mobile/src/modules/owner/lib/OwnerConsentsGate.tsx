"use client";

import { OwnerConsentsScreen } from "../screens/OwnerConsentsScreen";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OWNER_CONSENTS } from "./owner-consents-data";

export function OwnerConsentsGate() {
  return <OwnerConsentsScreen policies={DEMO_MODE ? OWNER_CONSENTS : []} />;
}
