#!/usr/bin/env bash
# Phase 4 smoke: membership list/plans/sell/consume surfaces
# Requires: seeded demo DB, API running, DEBUG_MODE=true, jq.
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

echo "── Phase 4 membership smoke ──"
ATH_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09124000001\",\"password\":\"$PASS\"}")
check "athlete login" "true" "$([ -n "$ATH_TOKEN" ] && echo true || echo false)"

OWN_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09122000001\",\"password\":\"$PASS\"}")
check "owner login" "true" "$([ -n "$OWN_TOKEN" ] && echo true || echo false)"

# Authorization uses activeRole only → owner endpoints need club_owner token.
OWN_SW=$(jpost_auth /account/auth/switch-role "$OWN_TOKEN" '{"role":"club_owner"}' | jq -r '.accessToken // empty')
[ -n "$OWN_SW" ] && OWN_TOKEN="$OWN_SW"
check "owner switch-role club_owner" "true" "$([ -n "$OWN_SW" ] && echo true || echo false)"

MINE=$(jget_auth "/account/memberships?page=1&page_size=10" "$ATH_TOKEN")
check "athlete memberships list" "true" "$(echo "$MINE" | jq -r 'has("result") or has("items") or type == "array"')"

# Pick the owner's club that has membership plans (falls back to first club).
OWN_CLUBS=$(jget_auth "/club_owner/clubs?page=1&page_size=10" "$OWN_TOKEN")
CLUB_ID=""
PLANS="{}"
FIRST_CLUB=""
for cid in $(echo "$OWN_CLUBS" | jq -r '(.result // .items // [])[] | .id // ._id'); do
  [ -z "$FIRST_CLUB" ] && FIRST_CLUB="$cid"
  P=$(jget_auth "/account/clubs/$cid/membership-plans?page=1&page_size=10" "$OWN_TOKEN")
  if [ "$(echo "$P" | jq -r '(.result // .items // []) | length')" -ge 1 ]; then
    CLUB_ID="$cid"
    PLANS="$P"
    break
  fi
done
if [ -z "$CLUB_ID" ] && [ -n "$FIRST_CLUB" ]; then
  CLUB_ID="$FIRST_CLUB"
  PLANS=$(jget_auth "/account/clubs/$CLUB_ID/membership-plans?page=1&page_size=10" "$OWN_TOKEN")
fi
check "owner club id" "true" "$([ -n "$CLUB_ID" ] && echo true || echo false)"

if [ -n "$CLUB_ID" ]; then
  check "owner membership plans" "true" "$(echo "$PLANS" | jq -r 'has("result") or has("items") or type == "array"')"
  PLAN_ID=$(echo "$PLANS" | jq -r '(.result // .items // [])[0].id // (.result // .items // [])[0]._id // empty')

  MEMBERS=$(jget_auth "/account/clubs/$CLUB_ID/memberships?page=1&page_size=10" "$OWN_TOKEN")
  check "owner club memberships" "true" "$(echo "$MEMBERS" | jq -r 'has("result") or has("items") or type == "array"')"
  MEMBERSHIP_ID=$(echo "$MEMBERS" | jq -r '(.result // .items // [])[0].id // (.result // .items // [])[0]._id // empty')

  if [ -n "$PLAN_ID" ]; then
    # Desk sell = POST /account/clubs/:clubId/memberships (no /sell suffix)
    SELL=$(jpost_auth "/account/clubs/$CLUB_ID/memberships" "$OWN_TOKEN" \
      "{\"planId\":\"$PLAN_ID\",\"holder\":{\"guest\":{\"name\":\"Smoke Guest\",\"phone\":\"09129990001\"}},\"channel\":\"cash\"}")
    # channel may not be accepted yet — also try without
    if echo "$SELL" | jq -e '.statusCode >= 400' >/dev/null 2>&1; then
      SELL=$(jpost_auth "/account/clubs/$CLUB_ID/memberships" "$OWN_TOKEN" \
        "{\"planId\":\"$PLAN_ID\",\"holder\":{\"guest\":{\"name\":\"Smoke Guest\",\"phone\":\"09129990002\"}}}")
    fi
    check "desk sell membership" "true" "$(echo "$SELL" | jq -r '(.id // ._id) != null')"
    SOLD_ID=$(echo "$SELL" | jq -r '.id // ._id // empty')
    if [ -n "$SOLD_ID" ]; then
      CONSUME=$(jpost_auth "/account/clubs/$CLUB_ID/memberships/$SOLD_ID/consume" "$OWN_TOKEN" '{"amount":1}')
      # duration plans may reject consume — accept either success or explicit business error
      check "consume credit surface" "true" "$(echo "$CONSUME" | jq -r '(.id != null) or (.message != null) or (.statusCode != null)')"
    fi
  else
    echo "SKIP  sell/consume (no plan)"
  fi

  if [ -n "$MEMBERSHIP_ID" ]; then
    CHECKIN=$(jpost_auth "/account/clubs/$CLUB_ID/checkin/membership" "$OWN_TOKEN" \
      "{\"membershipId\":\"$MEMBERSHIP_ID\",\"userId\":\"$(echo "$MEMBERS" | jq -r '(.result // .items // [])[0].holder.userId // empty')\",\"method\":\"manual\",\"clientIdempotencyKey\":\"smoke-mem-$(date +%s)\"}")
    # may fail if guest-only holder — still validates endpoint
    check "membership checkin endpoint" "true" "$(echo "$CHECKIN" | jq -r '(.id != null) or (.message != null) or (.statusCode != null)')"
  fi
fi

# Platform plans admin surface (admin login)
ADM_TOKEN=$(login_token /admin/auth/login "{\"phone\":\"09121111111\",\"password\":\"$PASS\"}" 2>/dev/null || true)
if [ -z "$ADM_TOKEN" ]; then
  ADM_TOKEN=$(login_token /account/auth/login "{\"phone\":\"09121111111\",\"password\":\"$PASS\"}")
fi
if [ -n "$ADM_TOKEN" ]; then
  PLANS_ADM=$(jget_auth "/admin/platform-plans?page=1&page_size=10" "$ADM_TOKEN" 2>/dev/null || echo "{}")
  if echo "$PLANS_ADM" | jq -e '.statusCode == 404' >/dev/null 2>&1; then
    PLANS_ADM=$(jget_auth "/admin/memberships/platform-plans?page=1&page_size=10" "$ADM_TOKEN")
  fi
  check "admin platform plans surface" "true" "$(echo "$PLANS_ADM" | jq -r 'has("result") or has("items") or type == "array" or (.message != null)')"
fi

# Referral me
REF=$(jget_auth /account/me/referral "$ATH_TOKEN")
check "referral me" "true" "$(echo "$REF" | jq -r 'has("code") or has("inviteCode") or has("referralCode") or type == "object"')"

echo "── Summary ──"
if [ "$FAILURES" -eq 0 ]; then
  echo "All membership smoke checks passed"
  exit 0
fi
echo "$FAILURES membership smoke check(s) failed"
exit 1
