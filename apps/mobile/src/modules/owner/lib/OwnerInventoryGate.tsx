"use client";

import { OwnerInventoryScreen } from "../screens/OwnerInventoryScreen";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OWNER_INVENTORY } from "./owner-inventory-data";

export function OwnerInventoryGate() {
  return <OwnerInventoryScreen items={DEMO_MODE ? OWNER_INVENTORY : []} />;
}
