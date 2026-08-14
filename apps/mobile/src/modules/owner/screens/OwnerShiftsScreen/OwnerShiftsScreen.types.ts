import type {
  OwnerLeaveRequest,
  OwnerStaffShift,
} from "../../lib/owner-shifts-data";

export type OwnerShiftsScreenProps = {
  shifts: OwnerStaffShift[];
  leaveRequests: OwnerLeaveRequest[];
  pendingId?: string | null;
  onApprove?: (request: OwnerLeaveRequest) => void;
  onReject?: (request: OwnerLeaveRequest) => void;
  className?: string;
};
