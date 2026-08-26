#!/usr/bin/env bash
# Full multi-role E2E scenario against a running local API:
#   1) new athlete registers via OTP
#   2) athlete browses a club, buys a membership plan (signup at club)
#   3) owner sees the new member
#   4) athlete books a class occurrence, pays (mock gateway)
#   5) owner sees the booking, checks the athlete in, completes it
#   6) owner membership check-in uses a signed offline snapshot, ordered sync,
#      replay protection, reconciliation dismissal and device revocation
#   7) athlete books again and cancels
#   8) coach opens a consult slot, athlete books + pays, coach checks in + completes
#   9) admin approves pending KYC / coach / club queues
#  10) concurrent refresh rotation has one winner and revokes reuse family
#
# Requires: db:seed + db:seed:demo, API with SMS_PROVIDER=mock, PAYMENT_PROVIDER=mock,
#           DEBUG_MODE=true, THROTTLE_DISABLED=true recommended, jq.
# Env:
#   API_URL       default http://localhost:8088/api/v1
#   API_LOG_FILE  optional server log used as a fallback when an older debug API
#                 does not return `debugCode` in the OTP response.
set -u
BASE="${API_URL:-http://localhost:8088/api/v1}"
PASS="Gym4Me!123"
LOG_FILE="${API_LOG_FILE:-}"
FAILURES=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "PASS  $name"
  else
    echo "FAIL  $name (expected=$expected actual=$actual)"
    FAILURES=$((FAILURES + 1))
  fi
}

note() { echo "      $1"; }

jpost() { curl -s -X POST "$BASE$1" -H 'Content-Type: application/json' -d "$2"; }
jpatch_auth() {
  curl -s -X PATCH "$BASE$1" -H 'Content-Type: application/json' -H "Authorization: Bearer $2" -d "$3"
}
jpost_auth() {
  local body="${3:-"{}"}"
  curl -s -X POST "$BASE$1" -H 'Content-Type: application/json' -H "Authorization: Bearer $2" -d "$body"
}
jget() { curl -s "$BASE$1"; }
jget_auth() { curl -s "$BASE$1" -H "Authorization: Bearer $2"; }
token_of() { jq -r '.accessToken // empty'; }

login_token() {
  local path="$1" body="$2" attempt token
  for attempt in 1 2 3 4 5; do
    token=$(jpost "$path" "$body" | token_of)
    if [ -n "$token" ]; then echo "$token"; return 0; fi
    sleep $((attempt * 2))
  done
  return 1
}

echo "════ S1: ثبت‌نام ورزشکار جدید با OTP ════"
NEW_PHONE="0912888$(date +%s | tail -c 5)"
ATH_TOKEN=""
ATH_LABEL="new-athlete"
OTP_RES=$(jpost /account/auth/otp "{\"phone\":\"$NEW_PHONE\"}")
check "S1.1 otp requested" "true" "$(echo "$OTP_RES" | jq -r '(.expiresInSeconds // 0) > 0')"
INTL_PHONE="+98${NEW_PHONE#0}"
OTP_CODE=$(echo "$OTP_RES" | jq -r '.debugCode // empty')
if [ -z "$OTP_CODE" ] && [ -n "$LOG_FILE" ] && [ -f "$LOG_FILE" ]; then
  # Older debug builds only wrote the code to the log. Filter by phone first so
  # parallel OTP requests cannot leak a different user's code into this flow.
  for _try in 1 2 3 4; do
    sleep 4
    OTP_CODE=$(grep -F "$INTL_PHONE" "$LOG_FILE" | grep -oE 'code=[0-9]{5}' | tail -1 | cut -d= -f2 || true)
    [ -n "$OTP_CODE" ] && break
  done
fi
check "S1.2 debug otp code available" "true" "$([[ "${OTP_CODE:-}" =~ ^[0-9]{5}$ ]] && echo true || echo false)"
CONFIRM=$(jpost /account/auth/otp/confirm "{\"phone\":\"$NEW_PHONE\",\"code\":\"${OTP_CODE:-00000}\",\"firstName\":\"سام\",\"lastName\":\"آزمایشی\"}")
ATH_TOKEN=$(echo "$CONFIRM" | token_of)
ATH_REFRESH=$(echo "$CONFIRM" | jq -r '.refreshToken // empty')
check "S1.3 otp confirm issues token" "true" "$([ -n "$ATH_TOKEN" ] && echo true || echo false)"
check "S1.3a otp confirm issues refresh token" "true" "$([ -n "$ATH_REFRESH" ] && echo true || echo false)"
if [ -z "$ATH_TOKEN" ]; then
  ATH_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09124000003\",\"password\":\"$PASS\"}")
  ATH_LABEL="athlete3"
fi
check "S1.4 athlete authenticated ($ATH_LABEL)" "true" "$([ -n "$ATH_TOKEN" ] && echo true || echo false)"
ATH_ME=$(jget_auth /account/profile/me "$ATH_TOKEN")
ATH_USER_ID=$(echo "$ATH_ME" | jq -r '.id // .user.id // ._id // .user._id // empty')
check "S1.5 athlete profile has id" "true" "$([ -n "$ATH_USER_ID" ] && echo true || echo false)"

echo ""
echo "════ S2: مالک وارد می‌شود و باشگاه فعال خودش را می‌بیند ════"
OWN_LOGIN=$(login_token /account/auth/login "{\"phone\":\"09122000001\",\"password\":\"$PASS\"}")
OSW=$(jpost_auth /account/auth/switch-role "$OWN_LOGIN" '{"role":"club_owner"}')
OWN_TOKEN=$(echo "$OSW" | token_of)
[ -z "$OWN_TOKEN" ] && OWN_TOKEN="$OWN_LOGIN"
check "S2.1 owner authenticated (club_owner)" "true" "$([ -n "$OWN_TOKEN" ] && echo true || echo false)"

OWN_CLUBS=$(jget_auth "/club_owner/clubs" "$OWN_TOKEN")
FROM=$(date +%F)
TO=$(date -v+14d +%F 2>/dev/null || date -d "+14 days" +%F)
CLUB_ID=""
CLUB_NAME=""
FALLBACK_ID=""
FALLBACK_NAME=""
for row in $(echo "$OWN_CLUBS" | jq -r '(.result // .items // .) | .[] | @base64' 2>/dev/null); do
  _c() { echo "$row" | base64 --decode | jq -r "$1"; }
  cid=$(_c '.id // ._id')
  # club must expose public published plans + upcoming calendar items
  plans=$(jget "/discovery/clubs/$cid/membership-plans?page=1&page_size=10")
  plan_count=$(echo "$plans" | jq -r '(.result // .items // []) | length' 2>/dev/null || echo 0)
  [ "${plan_count:-0}" -ge 1 ] || continue
  cal=$(jget "/discovery/clubs/$cid/calendar?from=$FROM&to=$TO")
  open_count=$(echo "$cal" | jq -r '[.days[].items[] | select(.remaining > 0)] | length' 2>/dev/null || echo 0)
  [ "${open_count:-0}" -ge 1 ] || continue
  if [ -z "$FALLBACK_ID" ]; then
    FALLBACK_ID="$cid"
    FALLBACK_NAME=$(_c '.identity.name // .name // "?"')
  fi
  # prefer a club whose occurrences carry a price so the gateway path is exercised
  priced=$(echo "$cal" | jq -r '[.days[].items[] | select(.remaining > 0 and (.price // 0) > 0)] | length' 2>/dev/null || echo 0)
  if [ "${priced:-0}" -ge 1 ]; then
    CLUB_ID="$cid"
    CLUB_NAME=$(_c '.identity.name // .name // "?"')
    break
  fi
done
if [ -z "$CLUB_ID" ]; then CLUB_ID="$FALLBACK_ID"; CLUB_NAME="$FALLBACK_NAME"; fi
check "S2.2 owner club with public plans found" "true" "$([ -n "$CLUB_ID" ] && echo true || echo false)"
note "club: $CLUB_NAME ($CLUB_ID)"

# Website and mobile both consume these exact public discovery contracts. Keep
# the seeded identity stable across owner operations and unauthenticated browse.
PUBLIC_CLUB=$(jget "/discovery/clubs/$CLUB_ID")
check "S2.3 public clients resolve the same club id" "$CLUB_ID" "$(echo "$PUBLIC_CLUB" | jq -r '.id // empty')"

echo ""
echo "════ S3: ورزشکار پلن‌ها را می‌بیند و در باشگاه ثبت‌نام می‌کند ════"
PLANS=$(jget "/discovery/clubs/$CLUB_ID/membership-plans?page=1&page_size=20")
PLAN_COUNT=$(echo "$PLANS" | jq -r '(.result // .items // []) | length')
check "S3.1 public plans visible to athlete" "true" "$([ "${PLAN_COUNT:-0}" -ge 1 ] && echo true || echo false)"
PLAN_SUMMARY=$(jget "/discovery/membership-plan-summaries?clubIds=$CLUB_ID")
check "S3.1a bounded catalog summary resolves same club" "$CLUB_ID" "$(echo "$PLAN_SUMMARY" | jq -r '.items[0].clubId // empty')"
# prefer a sessions plan so credit consumption is observable
PLAN_ID=$(echo "$PLANS" | jq -r '(.result // .items // []) | (map(select(.kind == "sessions")) + .)[0].id // empty')
PLAN_KIND=$(echo "$PLANS" | jq -r --arg id "$PLAN_ID" '(.result // .items // []) | .[] | select((.id // ._id) == $id) | .kind')
note "plan: $PLAN_ID kind=$PLAN_KIND"

CHECKOUT_PREVIEW=$(jpost_auth /account/memberships/checkouts/preview "$ATH_TOKEN" "{\"clubId\":\"$CLUB_ID\",\"planId\":\"$PLAN_ID\"}")
CHECKOUT_FINGERPRINT=$(echo "$CHECKOUT_PREVIEW" | jq -r '.fingerprint // empty')
CHECKOUT_CONSENT=$(echo "$CHECKOUT_PREVIEW" | jq -r '.consentVersion // empty')
CHECKOUT=$(jpost_auth /account/memberships/checkouts/initiate "$ATH_TOKEN" "{\"clubId\":\"$CLUB_ID\",\"planId\":\"$PLAN_ID\",\"idempotencyKey\":\"e2e-purchase-$(date +%s%N)\",\"previewFingerprint\":\"$CHECKOUT_FINGERPRINT\",\"consentVersion\":\"$CHECKOUT_CONSENT\",\"consentAccepted\":true,\"callbackUrl\":\"http://localhost:3000/athlete/memberships\"}")
CHECKOUT_ID=$(echo "$CHECKOUT" | jq -r '.checkoutId // empty')
CHECKOUT_AUTHORITY=$(echo "$CHECKOUT" | jq -r '.authority // empty')
if [ -n "$CHECKOUT_AUTHORITY" ]; then
  curl -s -o /dev/null "$BASE/payments/mock/complete?authority=$CHECKOUT_AUTHORITY&outcome=paid"
fi
PURCHASE=$(jpost_auth "/account/memberships/checkouts/$CHECKOUT_ID/verify" "$ATH_TOKEN" "{\"authority\":\"$CHECKOUT_AUTHORITY\",\"status\":\"OK\"}")
MEMBERSHIP_ID=$(echo "$PURCHASE" | jq -r '.membershipId // .membership.id // .id // ._id // empty')
check "S3.2 athlete self-purchase membership" "true" "$([ -n "$MEMBERSHIP_ID" ] && echo true || echo false)"
MEMBERSHIP=$(jget_auth "/account/memberships/$MEMBERSHIP_ID" "$ATH_TOKEN")
REMAIN_BEFORE=$(echo "$MEMBERSHIP" | jq -r '.credit.remainingSessions // .credit.remainingEntries // "null"')
note "membership: $MEMBERSHIP_ID remaining=$REMAIN_BEFORE"

MY_MEMBERSHIPS=$(jget_auth "/account/memberships?page=1&page_size=50" "$ATH_TOKEN")
check "S3.3 membership in athlete list" "true" "$(echo "$MY_MEMBERSHIPS" | jq -r --arg id "$MEMBERSHIP_ID" '[(.result // .items // [])[] | select((.id // ._id) == $id)] | length >= 1')"

echo ""
echo "════ S4: مالک عضو جدید را می‌بیند ════"
CLUB_MEMBERS=$(jget_auth "/account/clubs/$CLUB_ID/memberships?page=1&page_size=100" "$OWN_TOKEN")
check "S4.1 owner sees new membership" "true" "$(echo "$CLUB_MEMBERS" | jq -r --arg id "$MEMBERSHIP_ID" '[(.result // .items // [])[] | select((.id // ._id) == $id)] | length >= 1')"

echo ""
echo "════ S5: رزرو کلاس + پرداخت (mock) ════"
CAL=$(jget "/discovery/clubs/$CLUB_ID/calendar?from=$FROM&to=$TO")
# priced occurrences first so the mock-gateway path gets exercised
OCCURRENCES=$(echo "$CAL" | jq -c '[.days[] | . as $d | .items[] | select(.remaining > 0) | {slotId, classId: (.class.id // null), date: $d.date, price: (.price // 0)}] | sort_by((if .classId then 0 else 1 end), -.price)')
OCC_COUNT=$(echo "$OCCURRENCES" | jq -r 'length')
check "S5.1 open occurrence found" "true" "$([ "${OCC_COUNT:-0}" -ge 1 ] && echo true || echo false)"

PUBLIC_CLASS_ID=$(echo "$OCCURRENCES" | jq -r '[.[] | select(.classId != null)][0].classId // empty')
check "S5.1a seeded class occurrence found" "true" "$([ -n "$PUBLIC_CLASS_ID" ] && echo true || echo false)"
if [ -n "$PUBLIC_CLASS_ID" ]; then
  PUBLIC_CLASSES=$(jget "/discovery/classes?clubId=$CLUB_ID&page=1&page_size=100")
  check "S5.1b website/mobile class catalog shares calendar id" "true" "$(echo "$PUBLIC_CLASSES" | jq -r --arg id "$PUBLIC_CLASS_ID" '[(.result // .items // [])[] | select(.id == $id and .club.id != null)] | length == 1')"
  PUBLIC_CLASS=$(jget "/discovery/classes/$PUBLIC_CLASS_ID")
  check "S5.1c class detail preserves owning club" "$CLUB_ID" "$(echo "$PUBLIC_CLASS" | jq -r '.club.id // empty')"
fi

# try occurrences in order until one books (athlete may already hold some)
book_occurrence() {
  local token="$1" skip_json="$2" i occ slot date res id
  for i in $(seq 0 $((OCC_COUNT - 1))); do
    occ=$(echo "$OCCURRENCES" | jq -c ".[$i]")
    slot=$(echo "$occ" | jq -r '.slotId')
    date=$(echo "$occ" | jq -r '.date')
    if echo "$skip_json" | jq -e --arg s "$slot" --arg d "$date" '.[] | select(.slotId == $s and .date == $d)' >/dev/null 2>&1; then
      continue
    fi
    res=$(jpost_auth /account/bookings/club "$token" "{\"clubId\":\"$CLUB_ID\",\"slotId\":\"$slot\",\"dates\":[\"$date\"],\"idempotencyKey\":\"e2e-club-$slot-$date-$(date +%s%N)\"}")
    # createClubBooking returns { recurringGroupId, bookings: [...] }
    id=$(echo "$res" | jq -r '(.bookings // [])[0].id // (.id // ._id) // empty')
    if [ -n "$id" ]; then
      echo "$res" | jq -c --arg slotId "$slot" --arg date "$date" '((.bookings // [])[0] // .) + {slotId: $slotId, date: $date}'
      return 0
    fi
  done
  echo '{}'
  return 1
}

BOOKING=$(book_occurrence "$ATH_TOKEN" '[]')
BOOKING_ID=$(echo "$BOOKING" | jq -r '.id // empty')
BOOKING_STATUS=$(echo "$BOOKING" | jq -r '.status // empty')
BOOKED_SLOT=$(echo "$BOOKING" | jq -r '.slotId // empty')
BOOKED_DATE=$(echo "$BOOKING" | jq -r '.date // empty')
BOOKED_CATALOG_PRICE=$(echo "$OCCURRENCES" | jq -r --arg slot "$BOOKED_SLOT" --arg date "$BOOKED_DATE" '.[] | select(.slotId == $slot and .date == $date) | .price' | head -1)
check "S5.2 booking created" "true" "$([ -n "$BOOKING_ID" ] && echo true || echo false)"
check "S5.2a booking snapshot uses catalog price" "${BOOKED_CATALOG_PRICE:-0}" "$(echo "$BOOKING" | jq -r '.pricing.amount // 0')"
note "booking=$BOOKING_ID status=$BOOKING_STATUS slot=$BOOKED_SLOT date=$BOOKED_DATE"

# mock gateway mirrors Zarinpal: pay → checkout page (payer accepts) → callback → verify
pay_and_verify() {
  local booking_id="$1" token="$2" pay authority
  pay=$(jpost_auth "/account/bookings/$booking_id/pay" "$token" '{"callbackUrl":"http://localhost:3000/payment/callback"}')
  authority=$(echo "$pay" | jq -r '.authority // empty')
  [ -z "$authority" ] && { echo ""; return 1; }
  # simulate the payer pressing "پرداخت" on the mock checkout page
  curl -s -o /dev/null "$BASE/payments/mock/complete?authority=$authority&outcome=paid"
  jpost_auth "/account/bookings/$booking_id/pay/verify" "$token" "{\"authority\":\"$authority\",\"status\":\"OK\"}"
}

if [ "$BOOKING_STATUS" = "awaiting_payment" ]; then
  EXPIRES=$(echo "$BOOKING" | jq -r '.paymentExpiresAt // empty')
  check "S5.3 unpaid TTL (paymentExpiresAt) set" "true" "$([ -n "$EXPIRES" ] && echo true || echo false)"
  VERIFY=$(pay_and_verify "$BOOKING_ID" "$ATH_TOKEN")
  V_STATUS=$(echo "$VERIFY" | jq -r '.status // empty')
  check "S5.4 booking confirmed after gateway verify" "confirmed" "$V_STATUS"
else
  note "booking not awaiting payment (price=0) — status=$BOOKING_STATUS"
  check "S5.3 booking auto-confirmed" "confirmed" "$BOOKING_STATUS"
fi

echo ""
echo "════ S6: مالک رزرو را می‌بیند، حضور می‌زند و تکمیل می‌کند ════"
OWNER_BOOKINGS=$(jget_auth "/club_owner/clubs/$CLUB_ID/bookings?page=1&page_size=100" "$OWN_TOKEN")
check "S6.1 owner sees athlete booking" "true" "$(echo "$OWNER_BOOKINGS" | jq -r --arg id "$BOOKING_ID" '[(.result // .items // [])[] | select((.id // ._id) == $id)] | length >= 1')"

CHECKIN=$(jpost_auth "/club_owner/clubs/$CLUB_ID/bookings/$BOOKING_ID/checkin" "$OWN_TOKEN")
check "S6.2 owner checks athlete in" "checked_in" "$(echo "$CHECKIN" | jq -r '.status // empty')"

COMPLETE=$(jpost_auth "/club_owner/clubs/$CLUB_ID/bookings/$BOOKING_ID/complete" "$OWN_TOKEN")
check "S6.3 owner completes booking" "completed" "$(echo "$COMPLETE" | jq -r '.status // empty')"

ATH_BOOKING=$(jget_auth "/account/bookings/$BOOKING_ID" "$ATH_TOKEN")
check "S6.4 athlete sees completed booking" "completed" "$(echo "$ATH_BOOKING" | jq -r '.status // empty')"

echo ""
echo "════ S7: چک‌این عضویت + مصرف اعتبار ════"
DEVICE_NAME="e2e-capacitor-$(date +%s)"
DEVICE_RES=$(jpost_auth "/account/clubs/$CLUB_ID/checkin-devices" "$OWN_TOKEN" \
  "{\"name\":\"$DEVICE_NAME\",\"provider\":\"capacitor-e2e\"}")
DEVICE_ID=$(echo "$DEVICE_RES" | jq -r '.device.id // empty')
check "S7.1 offline device provisioned" "true" "$([ -n "$DEVICE_ID" ] && echo true || echo false)"

SNAPSHOT_RES=$(jpost_auth "/account/clubs/$CLUB_ID/checkin/offline-snapshots" "$OWN_TOKEN" \
  "{\"deviceId\":\"$DEVICE_ID\"}")
SNAPSHOT_TOKEN=$(echo "$SNAPSHOT_RES" | jq -r '.snapshotToken // empty')
SNAPSHOT_ID=$(echo "$SNAPSHOT_RES" | jq -r '.snapshot.id // empty')
SNAPSHOT_HAS_MEMBERSHIP=$(echo "$SNAPSHOT_RES" | jq -r --arg id "$MEMBERSHIP_ID" \
  '[.snapshot.memberships[] | select(.membershipId == $id)] | length == 1')
check "S7.2 signed snapshot contains active membership" "true" "$SNAPSHOT_HAS_MEMBERSHIP"

NOW_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OFFLINE_BATCH="{\"snapshotToken\":\"$SNAPSHOT_TOKEN\",\"items\":[{\"clientIdempotencyKey\":\"e2e-offline-membership-$MEMBERSHIP_ID\",\"method\":\"manual\",\"occurredAt\":\"$NOW_ISO\",\"sequence\":1,\"nonce\":\"e2e-offline-nonce-0001\",\"membershipId\":\"$MEMBERSHIP_ID\",\"userId\":\"$ATH_USER_ID\"}]}"
MEM_CHECKIN=$(jpost_auth "/account/clubs/$CLUB_ID/checkin/sync" "$OWN_TOKEN" "$OFFLINE_BATCH")
check "S7.3 ordered offline membership check-in accepted" "created" \
  "$(echo "$MEM_CHECKIN" | jq -r '.items[0].status // empty')"

OFFLINE_REPLAY=$(jpost_auth "/account/clubs/$CLUB_ID/checkin/sync" "$OWN_TOKEN" "$OFFLINE_BATCH")
check "S7.4 replay is idempotent" "duplicate" \
  "$(echo "$OFFLINE_REPLAY" | jq -r '.items[0].status // empty')"

REJECTED_BATCH="{\"snapshotToken\":\"$SNAPSHOT_TOKEN\",\"items\":[{\"clientIdempotencyKey\":\"e2e-offline-rejected-$MEMBERSHIP_ID\",\"method\":\"manual\",\"occurredAt\":\"$NOW_ISO\",\"sequence\":2,\"nonce\":\"e2e-offline-nonce-0002\",\"bookingCode\":\"G4M-NOT-IN-SNAPSHOT\"}]}"
REJECTED_SYNC=$(jpost_auth "/account/clubs/$CLUB_ID/checkin/sync" "$OWN_TOKEN" "$REJECTED_BATCH")
check "S7.5 non-snapshot eligibility is rejected" "rejected" \
  "$(echo "$REJECTED_SYNC" | jq -r '.items[0].status // empty')"

REJECTIONS=$(jget_auth "/account/clubs/$CLUB_ID/checkin/offline-reconciliations?status=rejected&page_size=100" "$OWN_TOKEN")
RECONCILIATION_ID=$(echo "$REJECTIONS" | jq -r --arg snapshot "$SNAPSHOT_ID" \
  '[(.result // [])[] | select(.snapshotId == $snapshot and .sequence == 2)][0].id // empty')
DISMISSED=$(jpost_auth "/account/clubs/$CLUB_ID/checkin/offline-reconciliations/$RECONCILIATION_ID/resolve" "$OWN_TOKEN" \
  '{"action":"dismiss","reason":"رکورد تست نامعتبر بود","clientMutationId":"e2e-resolution-dismiss-0001"}')
check "S7.6 rejected row is auditably dismissed" "dismissed" \
  "$(echo "$DISMISSED" | jq -r '.status // empty')"

REVOKED=$(jpost_auth "/account/clubs/$CLUB_ID/checkin-devices/$DEVICE_ID/revoke" "$OWN_TOKEN")
check "S7.7 device revoked" "revoked" "$(echo "$REVOKED" | jq -r '.device.status // empty')"
REVOKED_SYNC_HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  "$BASE/account/clubs/$CLUB_ID/checkin/sync" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $OWN_TOKEN" \
  -d "$REJECTED_BATCH")
check "S7.8 revoked device cannot sync" "404" "$REVOKED_SYNC_HTTP"

MEM_AFTER=$(jget_auth "/account/clubs/$CLUB_ID/memberships/$MEMBERSHIP_ID" "$OWN_TOKEN")
REMAIN_AFTER=$(echo "$MEM_AFTER" | jq -r '.credit.remainingSessions // .credit.remainingEntries // "null"')
note "credit: before=$REMAIN_BEFORE after=$REMAIN_AFTER"
if [ "$REMAIN_BEFORE" != "null" ] && [ "$REMAIN_AFTER" != "null" ]; then
  check "S7.9 credit consumed once after replay" "true" "$([ "$REMAIN_AFTER" -lt "$REMAIN_BEFORE" ] && echo true || echo false)"
else
  note "duration plan — no per-session credit to consume"
fi

ATH_CHECKINS=$(jget_auth "/account/checkin?page=1&page_size=20" "$ATH_TOKEN")
check "S7.10 athlete check-in history non-empty" "true" "$(echo "$ATH_CHECKINS" | jq -r '((.result // .items // []) | length) >= 1')"

echo ""
echo "════ S8: رزرو دوم + لغو توسط ورزشکار ════"
BOOKING2=$(book_occurrence "$ATH_TOKEN" "[{\"slotId\":\"$BOOKED_SLOT\",\"date\":\"$BOOKED_DATE\"}]")
BOOKING2_ID=$(echo "$BOOKING2" | jq -r '.id // empty')
BOOKING2_STATUS=$(echo "$BOOKING2" | jq -r '.status // empty')
check "S8.1 second booking created" "true" "$([ -n "$BOOKING2_ID" ] && echo true || echo false)"
if [ "$BOOKING2_STATUS" = "awaiting_payment" ]; then
  BOOKING2=$(pay_and_verify "$BOOKING2_ID" "$ATH_TOKEN")
  BOOKING2_STATUS=$(echo "$BOOKING2" | jq -r '.status // empty')
fi
CANCEL=$(jpost_auth "/account/bookings/$BOOKING2_ID/cancel" "$ATH_TOKEN" '{"note":"e2e cancel"}')
BOOKING2_CANCEL_STATUS=$(echo "$CANCEL" | jq -r '.status // empty')
if [ "$BOOKING2_STATUS" = "confirmed" ]; then
  check "S8.2 paid cancellation requests refund" "refund_requested" "$BOOKING2_CANCEL_STATUS"
  REFUND_BOOKING_ID="$BOOKING2_ID"
else
  check "S8.2 athlete cancels unpaid booking" "cancelled" "$BOOKING2_CANCEL_STATUS"
  REFUND_BOOKING_ID=""
fi

echo ""
echo "════ S9: مربی اسلات باز می‌کند، ورزشکار مشاوره رزرو می‌کند ════"
C_LOGIN=$(login_token /account/auth/login "{\"phone\":\"09123000001\",\"password\":\"$PASS\"}")
CSW=$(jpost_auth /account/auth/switch-role "$C_LOGIN" '{"role":"coach"}')
COACH_TOKEN=$(echo "$CSW" | token_of)
[ -z "$COACH_TOKEN" ] && COACH_TOKEN="$C_LOGIN"
check "S9.1 coach authenticated" "true" "$([ -n "$COACH_TOKEN" ] && echo true || echo false)"

COACH_ME=$(jget_auth /account/profile/me "$COACH_TOKEN")
COACH_USER_ID=$(echo "$COACH_ME" | jq -r '.id // .user.id // ._id // .user._id // empty')

PUBLIC_COACHES=$(jget "/discovery/coaches?verified=true&page=1&page_size=100")
check "S9.1a public clients resolve seeded coach user id" "true" "$(echo "$PUBLIC_COACHES" | jq -r --arg id "$COACH_USER_ID" '[(.result // .items // [])[] | select(.userId == $id)] | length == 1')"
PUBLIC_COACH=$(jget "/discovery/coaches/$COACH_USER_ID")
check "S9.1b public coach detail preserves user id" "$COACH_USER_ID" "$(echo "$PUBLIC_COACH" | jq -r '.userId // empty')"

# coach maintains their own consultation pricing (athletes cannot book unpriced kinds)
PRICING=$(curl -s -X PATCH "$BASE/account/profile/coach" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -d '{"pricing":{"consultation":{"inPerson":350000,"remote":200000}}}')
check "S9.2 coach sets consultation pricing" "true" "$(echo "$PRICING" | jq -r '(.statusCode // 200) < 400')"

# reuse an open published slot if one exists, otherwise create one at a unique time
TO7=$(date -v+7d +%F 2>/dev/null || date -d "+7 days" +%F)
PUB_SLOTS=$(jget "/discovery/coaches/$COACH_USER_ID/slots?from=$FROM&to=$TO7")
CSLOT_ID=$(echo "$PUB_SLOTS" | jq -r '[.slots[]? | select(.status == "open")][0].id // empty')
if [ -z "$CSLOT_ID" ]; then
  UMIN=$(( $(date +%s) % 50 + 5 ))
  # Try distinct future days so the smoke remains rerunnable even when a prior
  # interrupted run left an open or already-booked slot behind.
  for UDAY in 8 9 10 11 12 13 14; do
    if TM_START=$(date -v+"${UDAY}"d -v14H -v"${UMIN}M" -v0S -u +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null); then
      TM_END=$(date -v+"${UDAY}"d -v14H -v"${UMIN}M" -v0S -v+45M -u +%Y-%m-%dT%H:%M:%S.000Z)
    else
      TM_START_EPOCH=$(date -d "+$UDAY days 14:$UMIN" +%s)
      TM_START=$(date -u -d "@$TM_START_EPOCH" +%Y-%m-%dT%H:%M:%S.000Z)
      TM_END=$(date -u -d "@$((TM_START_EPOCH + 45 * 60))" +%Y-%m-%dT%H:%M:%S.000Z)
    fi
    CSLOTS=$(jpost_auth /coach/slots "$COACH_TOKEN" "{\"slots\":[{\"startsAt\":\"$TM_START\",\"endsAt\":\"$TM_END\"}]}")
    CSLOT_ID=$(echo "$CSLOTS" | jq -r 'if type == "array" then (.[0].id // .[0]._id) else ((.slots // .result // .items // [.])[0].id // (.slots // .result // .items // [.])[0]._id) end // empty')
    [ -n "$CSLOT_ID" ] && break
  done
fi
check "S9.3 coach slot available" "true" "$([ -n "$CSLOT_ID" ] && echo true || echo false)"

PUB_SLOT_AFTER=$(jget "/discovery/coaches/$COACH_USER_ID/slots?from=$FROM&to=$(date -v+15d +%F 2>/dev/null || date -d "+15 days" +%F)")
check "S9.3a public availability exposes same slot id" "true" "$(echo "$PUB_SLOT_AFTER" | jq -r --arg id "$CSLOT_ID" '[.slots[]? | select(.id == $id)] | length == 1')"

CBOOKING=$(jpost_auth /account/bookings "$ATH_TOKEN" "{\"coachUserId\":\"$COACH_USER_ID\",\"slotId\":\"$CSLOT_ID\",\"consultationKind\":\"remote\",\"idempotencyKey\":\"e2e-coach-$CSLOT_ID-$(date +%s%N)\"}")
CBOOKING_ID=$(echo "$CBOOKING" | jq -r '.id // ._id // empty')
CBOOKING_STATUS=$(echo "$CBOOKING" | jq -r '.status // empty')
check "S9.4 consult booking created" "true" "$([ -n "$CBOOKING_ID" ] && echo true || echo false)"
note "consult booking=$CBOOKING_ID status=$CBOOKING_STATUS"

if [ "$CBOOKING_STATUS" = "pending" ]; then
  CACCEPT=$(jpost_auth "/coach/bookings/$CBOOKING_ID/accept" "$COACH_TOKEN")
  CBOOKING_STATUS=$(echo "$CACCEPT" | jq -r '.status // empty')
  check "S9.5 coach accepts consult" "awaiting_payment" "$CBOOKING_STATUS"
fi

if [ "$CBOOKING_STATUS" = "awaiting_payment" ]; then
  CVERIFY=$(pay_and_verify "$CBOOKING_ID" "$ATH_TOKEN")
  check "S9.6 consult payment confirms booking" "confirmed" "$(echo "$CVERIFY" | jq -r '.status // empty')"
else
  check "S9.6 consult booking confirmed" "confirmed" "$CBOOKING_STATUS"
fi

COACH_BOOKINGS=$(jget_auth "/coach/bookings?page=1&page_size=50" "$COACH_TOKEN")
check "S9.7 coach sees consult booking" "true" "$(echo "$COACH_BOOKINGS" | jq -r --arg id "$CBOOKING_ID" '[(.result // .items // [])[] | select((.id // ._id) == $id)] | length >= 1')"

CCHECKIN=$(jpost_auth "/coach/bookings/$CBOOKING_ID/checkin" "$COACH_TOKEN")
check "S9.8 coach checks athlete in" "checked_in" "$(echo "$CCHECKIN" | jq -r '.status // empty')"
CCOMPLETE=$(jpost_auth "/coach/bookings/$CBOOKING_ID/complete" "$COACH_TOKEN")
check "S9.9 coach completes consult" "completed" "$(echo "$CCOMPLETE" | jq -r '.status // empty')"

echo ""
echo "════ S10: ادمین صف‌های تأیید را می‌بندد ════"
ADM_TOKEN=$(login_token /admin/account/auth/login "{\"phone\":\"09121111111\",\"password\":\"$PASS\"}")
check "S10.1 admin login" "true" "$([ -n "$ADM_TOKEN" ] && echo true || echo false)"

KYCQ=$(jget_auth "/admin/kyc/requests?status=pending" "$ADM_TOKEN")
KYC_ID=$(echo "$KYCQ" | jq -r '(.result // .items // [])[0].id // (.result // .items // [])[0]._id // empty')
if [ -n "$KYC_ID" ]; then
  KYC_RES=$(jpatch_auth "/admin/kyc/requests/$KYC_ID" "$ADM_TOKEN" '{"action":"approve"}')
  check "S10.2 admin approves pending KYC" "true" "$(echo "$KYC_RES" | jq -r '(.kycStatus // .status // empty) == "approved"')"
else
  note "no pending KYC — skipped"
fi

COACHQ=$(jget_auth "/admin/coaches/verifications?status=pending" "$ADM_TOKEN")
COACH_PENDING=$(echo "$COACHQ" | jq -r '(.result // .items // [])[0].userId // (.result // .items // [])[0].user.id // empty')
if [ -n "$COACH_PENDING" ]; then
  CV_RES=$(jpatch_auth "/admin/coaches/$COACH_PENDING/verification" "$ADM_TOKEN" '{"action":"approve","credential":{"typeKey":"integration_coaching_card","issuer":"مرجع تست یکپارچه","issuedAt":"2026-01-01","expiresAt":"2099-12-31"}}')
  check "S10.3 admin approves pending coach" "true" "$(echo "$CV_RES" | jq -r '(.verification.status // .status // empty) | test("approved|active")')"
else
  note "no pending coach verification — skipped"
fi

CLUBQ=$(jget_auth "/admin/clubs/verification?status=pending_review" "$ADM_TOKEN")
CLUB_PENDING=$(echo "$CLUBQ" | jq -r '(.result // .items // [])[0].id // (.result // .items // [])[0]._id // empty')
if [ -n "$CLUB_PENDING" ]; then
  CLV_RES=$(jpatch_auth "/admin/clubs/$CLUB_PENDING/verification" "$ADM_TOKEN" '{"action":"approve"}')
  check "S10.4 admin approves pending club" "true" "$(echo "$CLV_RES" | jq -r '((.review.status // .lifecycle.status // .status // "") | tostring) as $s | ($s != "" and $s != "pending_review") or ((.id // ._id) != null)')"
else
  note "no pending club verification — skipped"
fi

ADM_BOOKINGS=$(jget_auth "/admin/bookings?page=1&page_size=10" "$ADM_TOKEN")
check "S10.5 admin bookings list" "true" "$(echo "$ADM_BOOKINGS" | jq -r 'has("result") or has("items")')"
if [ -n "${REFUND_BOOKING_ID:-}" ]; then
  REFUNDED=$(jpost_auth "/admin/bookings/$REFUND_BOOKING_ID/refund" "$ADM_TOKEN" '{}')
  check "S10.6 admin settles refund" "refunded" "$(echo "$REFUNDED" | jq -r '.status // empty')"
  REFUND_PAYMENT=$(jget_auth "/admin/finance/payments?purpose=booking&page_size=100" "$ADM_TOKEN" \
    | jq -c --arg id "$REFUND_BOOKING_ID" '[(.result // .items // [])[] | select((.related.bookingId // "") == $id)][0] // {}')
  check "S10.7 refund updates payment state" "refunded" "$(echo "$REFUND_PAYMENT" | jq -r '.status // empty')"
  REFUND_PAYMENT_ID=$(echo "$REFUND_PAYMENT" | jq -r '._id // .id // empty')
  REFUND_LEDGER=$(jget_auth "/admin/finance/ledger?kind=refund&page_size=100" "$ADM_TOKEN" \
    | jq -c --arg id "$REFUND_PAYMENT_ID" '[(.result // .items // [])[] | select((.paymentId // "") == $id)][0] // {}')
  check "S10.8 refund ledger remains balanced" "true" "$(echo "$REFUND_LEDGER" | jq -r '. as $entry | ([$entry.lines[]? | .debit] | add // 0) as $d | ([$entry.lines[]? | .credit] | add // 0) as $c | ($d == $c and $d > 0)')"
fi

echo ""
echo "════ S11: رقابت rotation توکن refresh ════"
ROTATION_DIR=$(mktemp -d)
ROTATION_BODY=$(jq -nc --arg token "$ATH_REFRESH" '{refreshToken:$token}')
curl -s -X POST "$BASE/account/auth/refresh" -H 'Content-Type: application/json' --data-binary "$ROTATION_BODY" > "$ROTATION_DIR/one.json" &
ROTATE_ONE_PID=$!
curl -s -X POST "$BASE/account/auth/refresh" -H 'Content-Type: application/json' --data-binary "$ROTATION_BODY" > "$ROTATION_DIR/two.json" &
ROTATE_TWO_PID=$!
wait "$ROTATE_ONE_PID"
wait "$ROTATE_TWO_PID"
ROTATION_WINNERS=$(jq -s '[.[] | select((.accessToken // "") != "")] | length' "$ROTATION_DIR/one.json" "$ROTATION_DIR/two.json")
ROTATION_REJECTIONS=$(jq -s '[.[] | select((.accessToken // "") == "")] | length' "$ROTATION_DIR/one.json" "$ROTATION_DIR/two.json")
check "S11.1 concurrent refresh has exactly one winner" "1" "$ROTATION_WINNERS"
check "S11.2 reused refresh is rejected" "1" "$ROTATION_REJECTIONS"

echo ""
echo "════ نتیجه ════"
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL E2E SCENARIO CHECKS PASSED"
  exit 0
fi
echo "$FAILURES E2E CHECK(S) FAILED"
exit 1
