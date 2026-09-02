const keyMap: Record<string, string> = {
  legal_name: "legalName",
  trade_name: "tradeName",
  registration_number: "registrationNumber",
  tax_id: "taxId",
  custom_data: "customData",
  gender_policy: "genderPolicy",
  day_of_week: "dayOfWeek",
  opens_at: "opensAt",
  closes_at: "closesAt",
  employee_code: "employeeCode",
  branch_ids: "branchIds",
  coach_profile_id: "coachProfileId",
  coach_user_id: "coachUserId",
  coach_percentage_bps: "coachPercentageBps",
  booking_settings: "bookingSettings",
  slot_duration_minutes: "slotDurationMinutes",
  booking_window_days: "bookingWindowDays",
  minimum_advance_minutes: "minimumAdvanceMinutes",
  buffer_before_minutes: "bufferBeforeMinutes",
  buffer_after_minutes: "bufferAfterMinutes",
  allow_recurring: "allowRecurring",
  allow_group: "allowGroup",
  allow_family: "allowFamily",
  minimum_participants: "minimumParticipants",
  maximum_participants: "maximumParticipants",
  resource_requirements: "resourceRequirements",
  resource_id: "resourceId",
  revenue_share: "revenueShare",
  service_mode: "serviceMode",
  base_amount: "baseAmount",
  pricing_mode: "pricingMode",
  tax_included: "taxIncluded",
  duration_minutes: "durationMinutes",
  cancellation_window_minutes: "cancellationWindowMinutes",
  starts_on: "startsOn",
  ends_on: "endsOn",
  placement_ids: "placementIds",
  sport_ids: "sportIds",
  audience_roles: "audienceRoles",
  total_minor: "totalMinor",
  daily_minor: "dailyMinor",
  starts_at: "startsAt",
  ends_at: "endsAt",
  image_url: "imageUrl",
  destination_url: "destinationUrl",
  alt_text: "altText",
  amount_minor: "amountMinor",
  allowed_creative_types: "allowedCreativeTypes",
  entity_type_id: "entityTypeId",
  field_group_id: "fieldGroupId",
  taxonomy_id: "taxonomyId",
  parent_id: "parentId",
  storage_collection: "storageCollection",
  layout_config: "layoutConfig",
  display_order: "displayOrder",
  data_type: "dataType",
  default_value: "defaultValue",
  validation_rules: "validationRules",
  visibility_rules: "visibilityRules",
  permission_rules: "permissionRules",
  display_config: "displayConfig",
  search_config: "searchConfig",
};

export function toStorage(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toStorage);
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [keyMap[key] ?? key, toStorage(item)]),
  );
}

export function flattenPatch(value: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const mapped = toStorage(value) as Record<string, unknown>;
  for (const [key, item] of Object.entries(mapped)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === "object" && !Array.isArray(item) && !(item instanceof Date))
      Object.assign(result, flattenPatch(item as Record<string, unknown>, path));
    else result[path] = item;
  }
  return result;
}
