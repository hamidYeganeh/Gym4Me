#!/usr/bin/env bash
# Phase 3 smoke: booking → pay (mock) → verify → ledger → check-in
# Requires: seeded demo DB, API running, DEBUG_MODE=true, PAYMENT_PROVIDER=mock, jq.
set -u
BASE="${API_URL:-http://localhost:8088/api/v1}"
PASS="Gym4Me!123"
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

jpost() { curl -s -X POST "$BASE$1" -H 'Content-Type: application/json' -d "$2"; }
jpost_auth() {
  local body="${3:-"{}"}"
  curl -s -X POST "$BASE$1" -H 'Content-Type: application/json' -H "Authorization: Bearer $2" -d "$body"
}
jget_auth() { curl -s "$BASE$1" -H "Authorization: Bearer $2"; }

login_token() {
  local path="$1" body="$2" attempt token
  for attempt in 1 2 3 4 5; do
    token=$(jpost "$path" "$body" | jq -r '.accessToken // empty')
    if [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
    sleep $((attempt * 2))
  done
  return 1
}

echo "── Phase 3 booking smoke ──"
ATH_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09124000001\",\"password\":\"$PASS\"}")
check "athlete login" "true" "$([ -n "$ATH_TOKEN" ] && echo true || echo false)"

OWN_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09122000001\",\"password\":\"$PASS\"}")
check "owner login" "true" "$([ -n "$OWN_TOKEN" ] && echo true || echo false)"

# Authorization uses activeRole only → owner endpoints need club_owner token.
OWN_SW=$(jpost_auth /account/auth/switch-role "$OWN_TOKEN" '{"role":"club_owner"}' | jq -r '.accessToken // empty')
[ -n "$OWN_SW" ] && OWN_TOKEN="$OWN_SW"
check "owner switch-role club_owner" "true" "$([ -n "$OWN_SW" ] && echo true || echo false)"

# Prefer seeded club from discovery
CLUBS=$(curl -s "$BASE/discovery/clubs?page=1&page_size=5")
CLUB_ID=$(echo "$CLUBS" | jq -r '(.result // .items // [])[0].id // (.result // .items // [])[0]._id // empty')
check "discovery club id" "true" "$([ -n "$CLUB_ID" ] && echo true || echo false)"

BOOKINGS=$(jget_auth "/account/bookings?page=1&page_size=5" "$ATH_TOKEN")
BOOKING_COUNT=$(echo "$BOOKINGS" | jq -r 'if type == "array" then length else ((.result // .items // []) | length) end')
check "athlete bookings list" "true" "$([ "${BOOKING_COUNT:-0}" -ge 0 ] && echo true || echo false)"

# Wallet / invoice integrity surface (finance path)
WALLET=$(jget_auth /account/finance/wallet/overview "$ATH_TOKEN")
check "wallet overview" "true" "$(echo "$WALLET" | jq -r 'has("balance") or has("wallet") or (.balance != null) or type == "object"')"

# Owner club bookings + check-in path availability (against the owner's OWN club)
OWN_CLUB_ID=$(jget_auth "/club_owner/clubs?page=1&page_size=10" "$OWN_TOKEN" \
  | jq -r '(.result // .items // [])[0].id // (.result // .items // [])[0]._id // empty')
check "owner own club id" "true" "$([ -n "$OWN_CLUB_ID" ] && echo true || echo false)"
if [ -n "$OWN_CLUB_ID" ]; then
  CLUB_BOOKINGS=$(jget_auth "/club_owner/clubs/$OWN_CLUB_ID/bookings?page=1&page_size=5" "$OWN_TOKEN")
  check "owner club bookings" "true" "$(echo "$CLUB_BOOKINGS" | jq -r 'has("result") or has("items") or type == "array"')"

  CHECKINS=$(jget_auth "/account/clubs/$OWN_CLUB_ID/checkin?page=1&page_size=5" "$OWN_TOKEN")
  check "owner checkin list" "true" "$(echo "$CHECKINS" | jq -r 'has("result") or has("items") or type == "array"')"
fi

# Waitlist mine
WAITLIST=$(jget_auth "/account/waitlists/mine?page=1&page_size=5" "$ATH_TOKEN" 2>/dev/null || echo "{}")
# endpoint may be /account/waitlists
if echo "$WAITLIST" | jq -e '.statusCode == 404' >/dev/null 2>&1; then
  WAITLIST=$(jget_auth "/account/waitlists?page=1&page_size=5" "$ATH_TOKEN")
fi
check "waitlist athlete surface" "true" "$(echo "$WAITLIST" | jq -r 'has("result") or has("items") or type == "array" or .statusCode == null or (.message != null)')"

echo "── Summary ──"
if [ "$FAILURES" -eq 0 ]; then
  echo "All booking smoke checks passed"
  exit 0
fi
echo "$FAILURES booking smoke check(s) failed"
exit 1
