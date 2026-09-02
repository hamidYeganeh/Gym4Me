import assert from "node:assert/strict";
import {
  connectDatabase,
  disconnectDatabase,
  registerModels,
} from "../apps/api/dist/database/index.js";
import {
  ensureNotificationTemplates,
  processNotificationJob,
  routeOutboxEvent,
} from "../apps/worker/dist/notification-dispatcher.js";
import { runMaintenance } from "../apps/worker/dist/maintenance.js";

const baseUrl = (process.env.BASE_URL ?? "http://127.0.0.1:4019/api/v1").replace(/\/$/, "");
const mongoUri = process.env.MONGODB_URI;
const otpCode = process.env.OTP_CODE;
const adminMobile = process.env.P0_ADMIN_MOBILE ?? "+989120000099";
const adminPassword = process.env.P0_ADMIN_PASSWORD ?? "P0Integration!2026";
const athleteMobile = process.env.P0_ATHLETE_MOBILE ?? "+989120000001";

if (!mongoUri) throw new Error("MONGODB_URI is required");
if (!otpCode) throw new Error("OTP_CODE is required after requesting the local console OTP");

const id = (value) => String(value?._id ?? value?.id ?? "");
const unique = `${Date.now()}`;
const checkpoints = [];
const checkpoint = (name) => {
  checkpoints.push(name);
  process.stdout.write(`ok ${name}\n`);
};

async function request(path, { token, body, method = body ? "POST" : "GET", idempotent = false } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(idempotent ? { "idempotency-key": crypto.randomUUID() } : {}),
      "x-device-id": "gym4me-p0-integration",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(`${method} ${path} failed (${response.status}): ${JSON.stringify(payload)}`);
  return payload.data;
}

async function uploadPng(path, token) {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "p0-avatar.png");
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "x-device-id": "gym4me-p0-integration",
    },
    body: form,
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(`POST ${path} failed (${response.status}): ${JSON.stringify(payload)}`);
  return { asset: payload.data, png };
}

const health = await request("/health");
assert.equal(health.status, "ready");
checkpoint("health/readiness");

const openApiResponse = await fetch(`${new URL(baseUrl).origin}/docs-json`, {
  signal: AbortSignal.timeout(10_000),
});
assert.equal(openApiResponse.ok, true, `OpenAPI document failed (${openApiResponse.status})`);
const openApi = await openApiResponse.json();
const contractPaths = [
  "/api/v1/account/auth/otp/verify",
  "/api/v1/account/access-context",
  "/api/v1/catalog/coaches",
  "/api/v1/catalog/resources/{resourceId}/availability/slots",
  "/api/v1/bookings/checkout",
  "/api/v1/bookings/{bookingId}/reschedule",
  "/api/v1/bookings/{bookingId}/access-passes",
  "/api/v1/bookings/waitlist/{entryId}/claim",
  "/api/v1/finance/mock-gateway/payments/{paymentId}/decision",
  "/api/v1/finance/wallet/me/top-ups",
  "/api/v1/memberships/products/{productId}/purchase",
  "/api/v1/branches/{branchId}/bookings/{bookingId}/reschedule",
  "/api/v1/branches/{branchId}/access/check-ins",
  "/api/v1/admin/organizations",
  "/api/v1/notifications/devices/me",
];
for (const path of contractPaths) assert.ok(openApi.paths?.[path], `Missing API contract: ${path}`);
checkpoint("sdk/openapi-contract");

const athleteSession = await request("/account/auth/otp/verify", {
  body: { mobile: athleteMobile, purpose: "LOGIN", code: otpCode },
});
const athleteToken = athleteSession.tokens.access_token;
const athleteId = athleteSession.user_id;
assert.match(athleteToken, /^ey/);
checkpoint("account/otp-login");

await request("/account/security/password/set", {
  token: athleteToken,
  body: { new_password: "AthleteP1!2026" },
});
await request("/account/profile/me", {
  token: athleteToken,
  method: "PATCH",
  body: {
    identity: { first_name: "ورزشکار", last_name: "یکپارچه" },
    preferences: { units: { weight: "kg", distance: "km" } },
    custom_data: {
      athlete: {
        bio: "پروفایل تست P1",
        body: { heightCm: 180, weightKg: 75 },
        sportIds: ["fitness"],
        goalKeys: ["strength"],
      },
    },
  },
});
const athleteProfile = await request("/account/profile/me", { token: athleteToken });
assert.equal(athleteProfile.security.password_set, true);
assert.equal(athleteProfile.profile.identity.firstName, "ورزشکار");
assert.equal(athleteProfile.profile.preferences.units.weight, "kg");
assert.equal(athleteProfile.profile.customData.athlete.body.weightKg, 75);
const athletePasswordSession = await request("/account/auth/password/login", {
  body: { mobile: athleteMobile, password: "AthleteP1!2026" },
});
assert.match(athletePasswordSession.tokens.access_token, /^ey/);
checkpoint("account/password-profile-session");

const { asset: uploadedAsset, png: uploadedPng } = await uploadPng(
  "/uploads?purpose=avatar&visibility=public",
  athleteToken,
);
const uploadedAssetId = id(uploadedAsset);
assert.match(uploadedAssetId, /^[a-f\d]{24}$/i);
const assetMetadata = await request(`/uploads/${uploadedAssetId}`, { token: athleteToken });
assert.equal(assetMetadata.profile.mimeType, "image/png");
assert.equal(assetMetadata.access.visibility, "public");
const assetContentResponse = await fetch(
  `${baseUrl}/catalog/assets/${uploadedAssetId}/content`,
  { signal: AbortSignal.timeout(10_000) },
);
assert.equal(assetContentResponse.ok, true);
assert.deepEqual(Buffer.from(await assetContentResponse.arrayBuffer()), uploadedPng);
checkpoint("media/upload-metadata-public-content");

const adminSession = await request("/account/auth/password/login", {
  body: { mobile: adminMobile, password: adminPassword },
});
const adminToken = adminSession.tokens.access_token;
checkpoint("admin/password-login");

const organization = await request("/organizations", {
  token: athleteToken,
  body: {
    profile: {
      legal_name: `Gym4Me P0 ${unique}`,
      trade_name: "Gym4Me Integration",
      type: "club_business",
    },
    settings: { timezone: "Asia/Tehran", currency: "IRR" },
  },
});
const organizationId = id(organization);
assert.match(organizationId, /^[a-f\d]{24}$/i);
await request(`/admin/organizations/${organizationId}/status`, {
  token: adminToken,
  method: "PATCH",
  body: { status: "active", reason: "P0 integration fixture" },
});

const club = await request("/clubs", {
  token: athleteToken,
  body: {
    organization_id: organizationId,
    profile: { name: "باشگاه تست یکپارچه", slug: `p0-club-${unique}` },
    sports: [{ code: "fitness" }],
    amenities: [{ code: "parking" }],
  },
});
const clubId = id(club);
await request(`/admin/clubs/${clubId}/verification`, {
  token: adminToken,
  method: "PATCH",
  body: { status: "verified", reason: "P0 integration fixture" },
});

const branch = await request(`/clubs/${clubId}/branches`, {
  token: athleteToken,
  body: {
    profile: {
      name: "شعبه تست یکپارچه",
      slug: `p0-branch-${unique}`,
      gender_policy: "all",
      address: { city: "تهران", district: "مرکز" },
    },
    location: { latitude: 35.7219, longitude: 51.3347 },
  },
});
const branchId = id(branch);
await request(`/admin/branches/${branchId}/status`, {
  token: adminToken,
  method: "PATCH",
  body: { status: "active", reason: "P0 integration fixture" },
});
checkpoint("organization/club/branch-moderation");

const resource = await request(`/branches/${branchId}/resources`, {
  token: athleteToken,
  body: {
    type: "studio",
    profile: {
      name: "سالن تست",
      slug: `p0-resource-${unique}`,
      sports: ["fitness"],
      gender_policy: "all",
      amenities: [],
      equipment: [],
      images: [],
    },
    capacity: { mode: "shared", total: 12, minimum_participants: 1, maximum_participants: 12 },
    booking_settings: {
      slot_duration_minutes: 60,
      booking_window_days: 30,
      minimum_advance_minutes: 0,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      allow_recurring: true,
      allow_group: true,
    },
    status: "active",
  },
});
const resourceId = id(resource);

const offering = await request(`/organizations/${organizationId}/offerings`, {
  token: athleteToken,
  body: {
    branch_ids: [branchId],
    resource_requirements: [{ resource_id: resourceId, quantity: 1, mode: "required" }],
    provider: { type: "organization" },
    profile: {
      name: "جلسه تست رزرو",
      slug: `p0-offering-${unique}`,
      type: "club_session",
      sport: "fitness",
      service_mode: "in_person",
      images: [],
    },
    pricing: { currency: "IRR", base_amount: 500000, pricing_mode: "per_booking", tax_included: false },
    capacity: { mode: "shared", minimum: 1, maximum: 12 },
    booking_settings: {
      duration_minutes: 60,
      booking_window_days: 30,
      minimum_advance_minutes: 0,
      cancellation_window_minutes: 0,
      allow_recurring: true,
      allow_group: true,
      allow_family: true,
    },
    status: "active",
  },
});
const offeringId = id(offering);

const now = new Date();
const from = new Date(now.getTime() + 25 * 60 * 60_000);
const to = new Date(from.getTime() + 7 * 86_400_000);
for (let day = 0; day < 7; day += 1)
  await request(`/resources/${resourceId}/availability/rules`, {
    token: athleteToken,
    body: {
      schedule: { day_of_week: day, periods: [{ starts_at: "09:00", ends_at: "18:00" }] },
      capacity: { total: 12 },
      priority: 0,
      status: "active",
    },
  });

const catalog = await request(`/catalog/branches?search=${encodeURIComponent("شعبه تست یکپارچه")}`);
assert.ok(catalog.some((item) => id(item) === branchId));
const catalogOffering = await request(`/catalog/branches/${branchId}/offerings`);
assert.ok(catalogOffering.some((item) => id(item) === offeringId));
const slotResult = await request(
  `/catalog/resources/${resourceId}/availability/slots?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&participants=1`,
);
const availableSlots = slotResult.slots.filter((slot) => slot.status === "available");
assert.ok(availableSlots.length > 1);
checkpoint("public-catalog/availability");

async function checkoutAt(startsAt, participants = [{ kind: "self" }]) {
  const quote = await request("/bookings/quotes", {
    token: athleteToken,
    idempotent: true,
    body: {
      offering_id: offeringId,
      branch_id: branchId,
      starts_at: startsAt,
      participants,
    },
  });
  const hold = await request("/bookings/holds", {
    token: athleteToken,
    idempotent: true,
    body: { quote_id: id(quote) },
  });
  const checkout = await request("/bookings/checkout", {
    token: athleteToken,
    idempotent: true,
    body: { hold_token: hold.holdToken, payment_method: "sandbox_gateway" },
  });
  assert.equal(checkout.nextAction.type, "mock_gateway");
  assert.equal(checkout.payment.status, "pending");
  assert.equal(checkout.bookings[0].status, "pending_payment");
  return checkout;
}

const approvedCheckout = await checkoutAt(availableSlots[0].startAt);
const approvedPaymentId = approvedCheckout.nextAction.paymentId;
const approvedBookingId = id(approvedCheckout.bookings[0]);
const gatewayPayment = await request(`/finance/mock-gateway/payments/${approvedPaymentId}`, {
  token: athleteToken,
});
assert.equal(gatewayPayment.provider.code, "sandbox");
const approved = await request(`/finance/mock-gateway/payments/${approvedPaymentId}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "approve" },
});
assert.equal(approved.result.status, "paid");

const cancelledCheckout = await checkoutAt(availableSlots[1].startAt);
const cancelledPaymentId = cancelledCheckout.nextAction.paymentId;
const cancelledBookingId = id(cancelledCheckout.bookings[0]);
const cancelled = await request(`/finance/mock-gateway/payments/${cancelledPaymentId}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "cancel" },
});
assert.equal(cancelled.result.status, "cancelled");
checkpoint("booking/hold/test-gateway-approve-cancel");

const rescheduled = await request(`/bookings/${approvedBookingId}/reschedule`, {
  token: athleteToken,
  idempotent: true,
  body: { starts_at: availableSlots[2].startAt, reason: "P0 self-reschedule integration" },
});
assert.equal(rescheduled.status, "confirmed");
assert.equal(new Date(rescheduled.allocations[0].startAt).toISOString(), availableSlots[2].startAt);
checkpoint("booking/self-reschedule");

const membershipProduct = await request(`/organizations/${organizationId}/memberships/products`, {
  token: athleteToken,
  body: {
    profile: { name: "عضویت تستی P0", type: "entries" },
    scope: { club_ids: [clubId], branch_ids: [branchId], mode: "single_branch" },
    benefits: { sports: ["fitness"], entry_limit: 10, unlimited: false, included_services: [] },
    pricing: [{ id: "monthly", title: { fa: "ماهانه" }, amount_minor: "1000000", currency: "IRR", duration_days: 30 }],
    rules: { allow_family: false, maximum_beneficiaries: 1, transferable: false },
    status: "active",
  },
});
const membershipProductId = id(membershipProduct);
const membershipPurchase = await request(`/memberships/products/${membershipProductId}/purchase`, {
  token: athleteToken,
  body: {
    price_id: "monthly",
    beneficiaries: [{ user_id: athleteId }],
    idempotency_key: `membership-approved-${unique}`,
    payment_method: "sandbox_gateway",
  },
});
assert.equal(membershipPurchase.contract.status, "pending_payment");
const membershipPaymentId = membershipPurchase.nextAction.paymentId;
await request(`/finance/mock-gateway/payments/${membershipPaymentId}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "approve" },
});
const cancelledMembership = await request(`/memberships/products/${membershipProductId}/purchase`, {
  token: athleteToken,
  body: {
    price_id: "monthly",
    beneficiaries: [{ user_id: athleteId }],
    idempotency_key: `membership-cancelled-${unique}`,
    payment_method: "sandbox_gateway",
  },
});
await request(`/finance/mock-gateway/payments/${cancelledMembership.nextAction.paymentId}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "cancel" },
});
checkpoint("membership/test-gateway-approve-cancel");

const approvedTopUp = await request("/finance/wallet/me/top-ups", {
  token: athleteToken,
  idempotent: true,
  body: { amount_minor: "200000", currency: "IRR" },
});
await request(`/finance/mock-gateway/payments/${id(approvedTopUp)}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "approve" },
});
const cancelledTopUp = await request("/finance/wallet/me/top-ups", {
  token: athleteToken,
  idempotent: true,
  body: { amount_minor: "300000", currency: "IRR" },
});
await request(`/finance/mock-gateway/payments/${id(cancelledTopUp)}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "cancel" },
});
checkpoint("wallet-top-up/test-gateway-approve-cancel");

const group = [
  { kind: "self" },
  ...Array.from({ length: 11 }, (_, index) => ({
    kind: "guest",
    profile: { full_name: `مهمان تست ${index + 1}` },
  })),
];
const capacityCheckout = await checkoutAt(availableSlots[3].startAt, group);
await request(`/finance/mock-gateway/payments/${capacityCheckout.nextAction.paymentId}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "approve" },
});
const waitlistEntry = await request("/bookings/waitlist", {
  token: athleteToken,
  body: {
    offering_id: offeringId,
    branch_id: branchId,
    starts_at: availableSlots[3].startAt,
    participants: 1,
  },
});
await request(`/bookings/${id(capacityCheckout.bookings[0])}/cancel`, {
  token: athleteToken,
  idempotent: true,
  body: { reason: "آزادسازی ظرفیت برای تست waitlist" },
});

const issuedPasses = await request(`/bookings/${approvedBookingId}/access-passes`, {
  token: athleteToken,
  body: {},
});
assert.ok(issuedPasses[0]?.token);

const device = await request("/notifications/devices/me", {
  token: athleteToken,
  body: {
    installation_id: "p0-integration-installation",
    platform: "android",
    push: { token: "p0-integration-fcm-token", provider: "fcm" },
    device: { model: "integration" },
    app: { version: "0.1.0" },
  },
});
assert.equal(device.status, "active");

const models = registerModels(await connectDatabase(mongoUri));
await runMaintenance(models);
const offeredWaitlist = await models.WaitlistEntry.findById(id(waitlistEntry)).lean();
assert.equal(offeredWaitlist?.status, "offered");
const waitlistClaim = await request(`/bookings/waitlist/${id(waitlistEntry)}/claim`, {
  token: athleteToken,
  idempotent: true,
  body: {},
});
assert.equal(waitlistClaim.nextAction.type, "mock_gateway");
await request(`/finance/mock-gateway/payments/${waitlistClaim.nextAction.paymentId}/decision`, {
  token: athleteToken,
  idempotent: true,
  body: { decision: "approve" },
});
assert.equal((await models.WaitlistEntry.findById(id(waitlistEntry)).lean())?.status, "claimed");
checkpoint("waitlist-offer/claim/test-gateway");

await models.AccessPass.updateOne(
  { _id: issuedPasses[0].pass._id },
  { $set: { "validity.startsAt": new Date(Date.now() - 60_000), "validity.endsAt": new Date(Date.now() + 60_000) } },
);
const contexts = await request("/account/access-context", { token: athleteToken });
const ownerAssignment = contexts.assignments.find(
  (item) => item.role_code === "club_owner" && String(item.scope_id) === organizationId,
);
assert.ok(ownerAssignment);
const ownerSession = await request("/account/access-context/activate", {
  token: athleteToken,
  body: {
    role_id: String(ownerAssignment.role_id),
    scope_type: ownerAssignment.scope_type,
    scope_id: String(ownerAssignment.scope_id),
  },
});
const checkedIn = await request(`/branches/${branchId}/access/check-ins`, {
  token: ownerSession.access_token,
  body: { token: issuedPasses[0].token },
});
assert.equal(checkedIn.booking.status, "checked_in");
const checkedOut = await request(`/branches/${branchId}/access/check-outs/${id(checkedIn.checkIn)}`, {
  token: ownerSession.access_token,
  body: { note: "P0 integration" },
});
assert.equal(checkedOut.status, "checked_out");
checkpoint("access-pass/check-in/check-out");

const [approvedBooking, cancelledBooking, invoice, payment, outbox] = await Promise.all([
  models.Booking.findById(approvedBookingId).lean(),
  models.Booking.findById(cancelledBookingId).lean(),
  models.Invoice.findOne({ "source.paymentId": approvedPaymentId }).lean(),
  models.Payment.findById(approvedPaymentId).lean(),
  models.OutboxEvent.find({ "payload.payerUserId": athleteId }).lean(),
]);
const ledger = await models.LedgerTransaction.findById(payment?.ledgerTransactionId).lean();
assert.equal(approvedBooking?.status, "completed");
assert.equal(cancelledBooking?.status, "cancelled");
assert.equal(payment?.status, "paid");
assert.equal(invoice?.status, "issued");
assert.equal(ledger?.status, "posted");
const entries = ledger?.entries ?? [];
const debit = entries.filter((entry) => entry.side === "debit").reduce((sum, entry) => sum + BigInt(entry.amountMinor), 0n);
const credit = entries.filter((entry) => entry.side === "credit").reduce((sum, entry) => sum + BigInt(entry.amountMinor), 0n);
assert.equal(debit, credit);
assert.ok(outbox.some((event) => event.type === "payment.paid"));
assert.ok(outbox.some((event) => event.type === "payment.cancelled"));
const [membershipContract, membershipInvoice, walletSummary] = await Promise.all([
  models.MembershipContract.findOne({ "customData.idempotencyKey": `membership-approved-${unique}` }).lean(),
  models.Invoice.findOne({ "source.paymentId": membershipPaymentId }).lean(),
  request("/finance/wallet/me", { token: athleteToken }),
]);
assert.equal(membershipContract?.status, "active");
assert.equal(membershipInvoice?.status, "issued");
assert.ok(
  BigInt(walletSummary.balance.amountMinor) >= 200000n,
  "approved top-up must be present in the wallet balance",
);

await ensureNotificationTemplates(models);
for (const event of outbox) await routeOutboxEvent(models, event);
for (let processed = 0; processed < 30 && (await processNotificationJob(models)); processed += 1) {}
const notificationJobs = await models.NotificationJob.find({
  "recipient.id": athleteId,
  status: { $in: ["sent", "skipped"] },
}).lean();
const immediateJobs = notificationJobs.filter(
  (job) => new Date(job.schedule?.sendAt ?? 0) <= new Date(),
);
assert.ok(immediateJobs.some((job) => job.recipient?.channel === "push" && job.status === "sent"));
assert.ok(immediateJobs.some((job) => job.recipient?.channel === "sms" && job.status === "sent"));
assert.ok(immediateJobs.some((job) => job.recipient?.channel === "in_app" && job.status === "sent"));
assert.ok(
  immediateJobs
    .filter((job) => job.recipient?.channel === "push")
    .every((job) => String(job.payload?.action ?? "").startsWith("/athlete/")),
);
await disconnectDatabase();
checkpoint("invoice/double-entry-ledger/outbox");
checkpoint("worker/sms-push-in-app-delivery");

const inbox = await request("/notifications/me", { token: athleteToken });
assert.ok(inbox.length > 0);
assert.ok(inbox.every((item) => String(item.content?.action ?? "").startsWith("/athlete/")));

await request("/notifications/devices/p0-integration-installation/revoke", {
  token: athleteToken,
  body: {},
});
const devices = await request("/notifications/devices/me", { token: athleteToken });
assert.equal(devices.find((item) => item.installationId === "p0-integration-installation")?.status, "revoked");
checkpoint("push-device-register-revoke");

process.stdout.write(`P0 integration passed (${checkpoints.length} checkpoints).\n`);
