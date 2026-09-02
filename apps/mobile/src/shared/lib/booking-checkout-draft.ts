export type BookingCheckoutDraft = {
  holdToken: string;
  holdExpiresAt: string;
  branchId: string;
  offeringId: string;
  offeringName: string;
  startsAt: string;
  totalMinor: string;
  currency: string;
};

const KEY = "gym4me.booking.checkout.v2";
const OBJECT_ID = /^[a-f\d]{24}$/i;
type CheckoutStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveBookingCheckoutDraft(
  value: BookingCheckoutDraft,
  storage: CheckoutStorage = window.sessionStorage,
) {
  storage.setItem(KEY, JSON.stringify(value));
}

export function readBookingCheckoutDraft(
  storage: CheckoutStorage = window.sessionStorage,
): BookingCheckoutDraft | null {
  try {
    const value = JSON.parse(storage.getItem(KEY) ?? "null") as BookingCheckoutDraft;
    if (
      !value ||
      value.holdToken.length < 32 ||
      !OBJECT_ID.test(value.branchId) ||
      !OBJECT_ID.test(value.offeringId) ||
      !/^\d+$/.test(value.totalMinor) ||
      !Number.isFinite(new Date(value.startsAt).getTime()) ||
      !Number.isFinite(new Date(value.holdExpiresAt).getTime())
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function clearBookingCheckoutDraft(storage?: CheckoutStorage) {
  if (storage) storage.removeItem(KEY);
  else if (typeof window !== "undefined") window.sessionStorage.removeItem(KEY);
}
