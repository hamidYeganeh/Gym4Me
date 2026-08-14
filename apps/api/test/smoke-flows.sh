#!/usr/bin/env bash
# End-to-end smoke test for phase 1-2 flows against a running local API.
# Requires: db:seed + db:seed:demo already applied, DEBUG_MODE=true, jq.
# List endpoints return { pagination, result } and use page / page_size params.
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
jget() { curl -s "$BASE$1"; }
jget_auth() { curl -s "$BASE$1" -H "Authorization: Bearer $2"; }
list_len() { jq -r 'if type == "array" then length else ((.result // .items // []) | length) end'; }
is_list_response() { jq -r 'type == "array" or ((.result // .items) | type == "array")'; }
token_of() { jq -r '.accessToken // empty'; }

# login endpoints are throttled — retry with backoff instead of failing fast
login_token() {
  local path="$1" body="$2" attempt token
  for attempt in 1 2 3 4 5; do
    token=$(jpost "$path" "$body" | token_of)
    if [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
    sleep $((attempt * 2))
  done
  return 1
}

echo "── A1: OTP register/login (new user) ──"
OTP_PHONE="09125$(date +%s | tail -c 6)1"
OTP_RES=$(jpost /account/auth/otp "{\"phone\":\"$OTP_PHONE\"}")
# debugCode is intentionally NOT returned over HTTP (logged server-side when DEBUG_MODE=true).
check "otp request accepted" "true" "$(echo "$OTP_RES" | jq -r '(.expiresInSeconds // 0) > 0')"
# Password login covers auth; OTP confirm requires reading server debug logs when DEBUG_MODE=true.
echo "  note: OTP confirm skipped in smoke (no debugCode in HTTP response)"

echo "── A2: password login (seeded athlete) ──"
ATH_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09124000001\",\"password\":\"$PASS\"}")
check "athlete password login" "true" "$([ -n "$ATH_TOKEN" ] && echo true || echo false)"

echo "── A3: profile ──"
ME=$(jget_auth /account/profile/me "$ATH_TOKEN")
check "profile me name" "علی" "$(echo "$ME" | jq -r '.name.first // .user.name.first // empty')"

echo "── A5: KYC status ──"
KYC=$(jget_auth /account/kyc "$ATH_TOKEN")
check "athlete1 kyc approved" "approved" "$(echo "$KYC" | jq -r '.kycStatus // empty')"

echo "── A4: switch role (coach1 athlete→coach) ──"
C_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09123000001\",\"password\":\"$PASS\"}")
SWITCH=$(jpost_auth /account/auth/switch-role "$C_TOKEN" '{"role":"coach"}')
SW_ROLE=$(echo "$SWITCH" | jq -r '.activeRole // empty')
check "switch-role activeRole=coach" "coach" "$SW_ROLE"

echo "── C1-C2: discovery clubs ──"
CLUBS=$(jget "/discovery/clubs?page=1&page_size=10")
CLUB_COUNT=$(echo "$CLUBS" | list_len)
check "discovery clubs >= 3" "true" "$([ "${CLUB_COUNT:-0}" -ge 3 ] && echo true || echo false)"
CLUB_ID=$(echo "$CLUBS" | jq -r '(.result // .items)[0].id // (.result // .items)[0]._id')
DETAIL=$(jget "/discovery/clubs/$CLUB_ID")
check "club detail has name" "true" "$(echo "$DETAIL" | jq -r '(.identity.name // .name) != null')"
REVIEWS=$(jget "/discovery/clubs/$CLUB_ID/reviews")
check "club reviews endpoint" "true" "$(echo "$REVIEWS" | jq -r 'has("result") or has("items")')"
CAL=$(jget "/discovery/clubs/$CLUB_ID/calendar")
check "club calendar endpoint" "true" "$(echo "$CAL" | jq -r 'type == "object" or type == "array"')"

echo "── C3: discovery coaches ──"
COACHES=$(jget "/discovery/coaches?page=1&page_size=10")
COACH_COUNT=$(echo "$COACHES" | list_len)
check "discovery coaches >= 2 (approved only)" "true" "$([ "${COACH_COUNT:-0}" -ge 2 ] && echo true || echo false)"

echo "── B4: owner clubs ──"
O_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09122000001\",\"password\":\"$PASS\"}")
OSWITCH=$(jpost_auth /account/auth/switch-role "$O_TOKEN" '{"role":"club_owner"}')
OW_TOKEN=$(echo "$OSWITCH" | token_of)
MINE=$(jget_auth "/club_owner/clubs" "$OW_TOKEN")
MINE_COUNT=$(echo "$MINE" | list_len)
check "owner1 sees own clubs >= 3" "true" "$([ "${MINE_COUNT:-0}" -ge 3 ] && echo true || echo false)"

echo "── M1/M2/M3: admin panel flows ──"
A_TOKEN=$(login_token /admin/account/auth/login "{\"phone\":\"09121111111\",\"password\":\"$PASS\"}")
check "admin password login" "true" "$([ -n "$A_TOKEN" ] && echo true || echo false)"
USERS=$(jget_auth "/admin/users?page=1&page_size=20" "$A_TOKEN")
USER_COUNT=$(echo "$USERS" | list_len)
check "admin users list >= 9" "true" "$([ "${USER_COUNT:-0}" -ge 9 ] && echo true || echo false)"
KYCQ=$(jget_auth "/admin/kyc/requests?status=pending" "$A_TOKEN")
check "admin kyc pending queue responds" "true" "$(echo "$KYCQ" | is_list_response)"
COACHQ=$(jget_auth "/admin/coaches/verifications?status=pending" "$A_TOKEN")
check "admin coach verification queue responds" "true" "$(echo "$COACHQ" | is_list_response)"
CLUBQ=$(jget_auth "/admin/clubs/verification?status=pending_review" "$A_TOKEN")
check "admin club verification queue responds" "true" "$(echo "$CLUBQ" | is_list_response)"

echo "── basics + faq (public) ──"
CHOICES=$(jget "/basics/choices")
check "choices include gender" "true" "$(echo "$CHOICES" | jq -r '[(.result // .)[] | select(.value == "gender" or .key == "gender")] | length >= 1')"
FAQ=$(jget "/support/faq")
check "public faq >= 3" "true" "$([ "$(echo "$FAQ" | list_len)" -ge 3 ] && echo true || echo false)"

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL SMOKE TESTS PASSED"
else
  echo "$FAILURES SMOKE TEST(S) FAILED"
  exit 1
fi
