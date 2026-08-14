"use client";

import { OwnerFamilyMembershipsScreen } from "../screens/OwnerFamilyMembershipsScreen";
import { OWNER_FAMILY_MEMBERSHIPS } from "./owner-family-memberships-data";

export function OwnerFamilyMembershipsGate() {
  return <OwnerFamilyMembershipsScreen plans={OWNER_FAMILY_MEMBERSHIPS} />;
}
