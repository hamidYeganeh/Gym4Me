"use client";

import { useState } from "react";
import { OwnerShiftsScreen } from "../screens/OwnerShiftsScreen";
import {
  OWNER_LEAVE_REQUESTS,
  OWNER_SHIFTS,
  type OwnerLeaveRequest,
} from "./owner-shifts-data";

export function OwnerShiftsGate() {
  const [leaveRequests, setLeaveRequests] = useState(OWNER_LEAVE_REQUESTS);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const updateLeave = (request: OwnerLeaveRequest, status: "approved" | "rejected") => {
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
      onApprove={(request) => updateLeave(request, "approved")}
      onReject={(request) => updateLeave(request, "rejected")}
      pendingId={pendingId}
      shifts={OWNER_SHIFTS}
    />
  );
}
