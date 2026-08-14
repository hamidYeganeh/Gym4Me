"use client";

import { OwnerConsentsScreen } from "../screens/OwnerConsentsScreen";
import { OWNER_CONSENTS } from "./owner-consents-data";

export function OwnerConsentsGate() {
  return <OwnerConsentsScreen policies={OWNER_CONSENTS} />;
}
