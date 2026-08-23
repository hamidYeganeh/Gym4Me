"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/shared/lib/runtime-mode";
import { OwnerShiftsScreen } from "../screens/OwnerShiftsScreen";
import {
  OWNER_LEAVE_REQUESTS,
  OWNER_SHIFTS,
  type OwnerLeaveRequest,
} from "./owner-shifts-data";

export function OwnerShiftsGate() {
  const [leaveRequests, setLeaveRequests] = useState(
    DEMO_MODE ? OWNER_LEAVE_REQUESTS : [],
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const updateLeave = (
    request: OwnerLeaveRequest,
    status: "approved" | "rejected",
  ) => {
    setPendingId(request.id);
    setTimeout(() => {
      setLeaveRequests((previous) =>
        previous.map((entry) =>
          entry.id === request.id ? { ...entry, status } : entry,
        ),
      );
      setPendingId(null);
    }, 300);
  };

  return (
    <OwnerShiftsScreen
      leaveRequests={leaveRequests}
      onApprove={
        DEMO_MODE ? (request) => updateLeave(request, "approved") : undefined
      }
      onReject={
        DEMO_MODE ? (request) => updateLeave(request, "rejected") : undefined
      }
      pendingId={pendingId}
      shifts={DEMO_MODE ? OWNER_SHIFTS : []}
    />
  );
}
