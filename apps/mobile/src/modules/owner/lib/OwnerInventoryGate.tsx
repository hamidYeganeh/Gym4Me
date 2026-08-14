"use client";

import { OwnerInventoryScreen } from "../screens/OwnerInventoryScreen";
import { OWNER_INVENTORY } from "./owner-inventory-data";

export function OwnerInventoryGate() {
  return <OwnerInventoryScreen items={OWNER_INVENTORY} />;
}
