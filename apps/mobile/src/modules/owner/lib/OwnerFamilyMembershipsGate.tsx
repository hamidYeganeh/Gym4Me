"use client";

import { OwnerFamilyMembershipsScreen } from "../screens/OwnerFamilyMembershipsScreen";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OWNER_FAMILY_MEMBERSHIPS } from "./owner-family-memberships-data";

export function OwnerFamilyMembershipsGate() {
  return (
    <OwnerFamilyMembershipsScreen
      plans={DEMO_MODE ? OWNER_FAMILY_MEMBERSHIPS : []}
    />
  );
}
