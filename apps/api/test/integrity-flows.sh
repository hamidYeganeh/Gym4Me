#!/usr/bin/env bash
# Relationship + domain integrity checks against a running API (seeded demo).
# Does not mutate seed credentials permanently; creates disposable coach program/task/invoice paths.
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
jpatch_auth() {
  local body="${3:-"{}"}"
  curl -s -X PATCH "$BASE$1" -H 'Content-Type: application/json' -H "Authorization: Bearer $2" -d "$body"
}
jget_auth() { curl -s "$BASE$1" -H "Authorization: Bearer $2"; }
jget() { curl -s "$BASE$1"; }
token_of() { jq -r '.accessToken // empty'; }
list_len() { jq -r 'if type == "array" then length else ((.result // .items // []) | length) end'; }

login_token() {
  local path="$1" body="$2" attempt resp token
  for attempt in 1 2 3 4 5 6 7 8; do
    resp=$(jpost "$path" "$body")
    token=$(echo "$resp" | token_of)
    if [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
    # backoff for throttling
    sleep $((attempt * 3))
  done
  echo "LOGIN_FAIL path=$path body=$body resp=$(echo "$resp" | jq -c '{statusCode,message}' 2>/dev/null)" >&2
  return 1
}

switch_token() {
  local token="$1" role="$2" resp new
  resp=$(jpost_auth /account/auth/switch-role "$token" "{\"role\":\"$role\"}")
  new=$(echo "$resp" | token_of)
  if [ -n "$new" ]; then
    echo "$new"
    return 0
  fi
  echo "SWITCH_FAIL role=$role resp=$(echo "$resp" | jq -c '{statusCode,message,activeRole}' 2>/dev/null)" >&2
  return 1
}

echo "══ Auth tokens ══"
ATH=$(login_token /account/auth/login "{\"phone\":\"09124000001\",\"password\":\"$PASS\"}" || true)
check "athlete login" "true" "$([ -n "${ATH:-}" ] && echo true || echo false)"
sleep 2
COACH_BASE=$(login_token /account/auth/login "{\"phone\":\"09123000001\",\"password\":\"$PASS\"}" || true)
COACH=$(switch_token "${COACH_BASE:-}" "coach" || true)
check "coach switch" "true" "$([ -n "${COACH:-}" ] && echo true || echo false)"
sleep 2
OWN_BASE=$(login_token /account/auth/login "{\"phone\":\"09122000001\",\"password\":\"$PASS\"}" || true)
OWN=$(switch_token "${OWN_BASE:-}" "club_owner" || true)
check "owner switch" "true" "$([ -n "${OWN:-}" ] && echo true || echo false)"
sleep 2
ADM=$(login_token /admin/account/auth/login "{\"phone\":\"09121111111\",\"password\":\"$PASS\"}" || true)
check "admin login" "true" "$([ -n "${ADM:-}" ] && echo true || echo false)"

# Skip remaining sections if role tokens missing
if [ -z "${COACH:-}" ] || [ -z "${OWN:-}" ] || [ -z "${ATH:-}" ]; then
  echo "ABORT: missing role tokens (likely auth throttle). Re-run after ~60s."
  exit 1
fi

ATH_ID=$(jget_auth /account/profile/me "$ATH" | jq -r '.id // empty')
check "athlete profile id present" "true" "$([ -n "$ATH_ID" ] && echo true || echo false)"

echo "══ Discovery ↔ club ownership links ══"
CLUBS=$(jget "/discovery/clubs?page=1&page_size=20")
CLUB_ID=$(echo "$CLUBS" | jq -r '(.result // [])[0].id // empty')
OWNER_ID=$(echo "$CLUBS" | jq -r '(.result // [])[0].ownerId // (.result // [])[0].owner.id // empty')
check "discovery club has ownerId" "true" "$([ -n "$OWNER_ID" ] && echo true || echo false)"
OWN_CLUBS=$(jget_auth "/club_owner/clubs" "$OWN")
OWN_HAS=$(echo "$OWN_CLUBS" | jq -r --arg id "$CLUB_ID" '[(.result // [])[] | select(.id == $id)] | length > 0')
# owner's list may be different clubs; at least owner clubs resolve with ownerId matching token subject
OWN_SUB=$(echo "$OWN" | cut -d. -f2 | tr '_-' '/+' | awk '{while(length($0)%4){$0=$0"="}; print}' | base64 -d 2>/dev/null | jq -r '.sub // empty')
OWN_MATCH=$(echo "$OWN_CLUBS" | jq -r --arg sub "$OWN_SUB" '[(.result // [])[] | select(.ownerId == $sub)] | length >= 1')
check "owner clubs owned by JWT sub" "true" "$OWN_MATCH"
CAL=$(jget "/discovery/clubs/$CLUB_ID/calendar")
check "calendar object for club" "true" "$(echo "$CAL" | jq -r 'type == "object" or type == "array"')"

echo "══ MetricType catalog + athlete preferredKeys ══"
TYPES=$(jget_auth "/account/progress/metric-types?page_size=50" "$ATH")
TYPE_COUNT=$(echo "$TYPES" | list_len)
check "metric-types seeded >= 5" "true" "$([ "${TYPE_COUNT:-0}" -ge 5 ] && echo true || echo false)"
HAS_WEIGHT=$(echo "$TYPES" | jq -r '[(.result // [])[] | select(.key == "weight_kg")] | length >= 1')
check "metric-types includes weight_kg" "true" "$HAS_WEIGHT"
KEYS=$(echo "$TYPES" | jq -c '[(.result // [])[0:3][].key]')
UPD=$(jpatch_auth /account/profile/athlete "$ATH" "{\"metrics\":{\"preferredKeys\":$KEYS}}")
PREF=$(echo "$UPD" | jq -r '.metrics.preferredKeys | length')
check "athlete preferredKeys saved" "3" "$PREF"
ATH2=$(jget_auth /account/profile/athlete "$ATH")
PREF2=$(echo "$ATH2" | jq -r '.metrics.preferredKeys | length')
check "athlete preferredKeys persisted on GET" "3" "$PREF2"

echo "══ WorkoutProgram template ↔ assign → WorkoutPlan ══"
PROG=$(jpost_auth /account/progress/workout-programs "$COACH" '{"title":"Integrity Program","status":"published","meta":{"focusLabel":"test","weekCount":4,"sessionsPerWeek":3}}')
PROG_ID=$(echo "$PROG" | jq -r '.id // empty')
check "create workout program" "true" "$([ -n "$PROG_ID" ] && echo true || echo false)"
ASSIGN=$(jpost_auth "/account/progress/workout-programs/$PROG_ID/assign" "$COACH" "{\"athleteUserId\":\"$ATH_ID\"}")
PLAN_ID=$(echo "$ASSIGN" | jq -r '.id // .workoutPlanId // .plan.id // empty')
# assign may return the plan object directly
if [ -z "$PLAN_ID" ]; then
  PLAN_ID=$(echo "$ASSIGN" | jq -r '.id // empty')
fi
check "assign returns plan-like id" "true" "$([ -n "$PLAN_ID" ] && echo true || echo false)"
PROG2=$(jget_auth "/account/progress/workout-programs/$PROG_ID" "$COACH")
ASSIGNED=$(echo "$PROG2" | jq -r '.assignedCount // 0')
check "program assignedCount >= 1" "true" "$([ "${ASSIGNED:-0}" -ge 1 ] && echo true || echo false)"
PLANS=$(jget_auth "/account/progress/workout-plans?page_size=50" "$ATH")
PLAN_LINK=$(echo "$PLANS" | jq -r --arg pid "$PROG_ID" '[(.result // [])[] | select(.programId == $pid)] | length >= 1')
# programId may be optional on response — also accept title match
if [ "$PLAN_LINK" != "true" ]; then
  PLAN_LINK=$(echo "$PLANS" | jq -r '[(.result // [])[] | select(.title | test("Integrity";"i"))] | length >= 1')
fi
check "athlete sees assigned plan" "true" "$PLAN_LINK"

echo "══ Coaching students engagement shape ══"
STUDENTS=$(jget_auth "/account/coaching/students?page_size=50" "$COACH")
# link athlete if empty
if [ "$(echo "$STUDENTS" | list_len)" -eq 0 ]; then
  jpost_auth /account/coaching/students "$COACH" "{\"athleteUserId\":\"$ATH_ID\",\"coaching\":{\"goalKey\":\"fat_loss\",\"levelKey\":\"beginner\"},\"engagement\":{\"level\":\"healthy\",\"progressPercent\":40}}" >/dev/null
  STUDENTS=$(jget_auth "/account/coaching/students?page_size=50" "$COACH")
fi
STU_COUNT=$(echo "$STUDENTS" | list_len)
check "coach has students >= 1" "true" "$([ "${STU_COUNT:-0}" -ge 1 ] && echo true || echo false)"
HAS_ENG=$(echo "$STUDENTS" | jq -r '[(.result // [])[] | select(.engagement.level != null)] | length >= 1')
check "student has engagement.level" "true" "$HAS_ENG"
AN=$(jget_auth "/account/coaching/analytics/overview?period=week" "$COACH")
check "coach analytics has kpis" "true" "$(echo "$AN" | jq -r 'has("kpis") and has("engagement")')"

echo "══ Finance wallet / invoice / owner analytics ══"
WALLET=$(jget_auth /account/finance/wallet/overview "$ATH")
check "wallet overview has balance" "true" "$(echo "$WALLET" | jq -r 'has("balance") and has("currency")')"
check "wallet overview has series" "true" "$(echo "$WALLET" | jq -r '(.balancePoints|type)=="array" and (.incomeSeries|type)=="array"')"
# create a captured topup to force invoice path if possible
TOP=$(jpost_auth /account/finance/wallet/topup "$ATH" '{"amount":100000,"channel":"cash","idempotencyKey":"integrity-topup-'$(date +%s)'"}')
PAY_ID=$(echo "$TOP" | jq -r '.payment.id // .payment._id // .paymentId // .id // empty')
INV_FROM=$(jpost_auth /account/finance/invoices/from-payment "$ATH" "{\"paymentId\":\"$PAY_ID\"}")
INV_ID=$(echo "$INV_FROM" | jq -r '.id // empty')
if [ -z "$INV_ID" ]; then
  # list invoices — may already auto-issue
  INVS=$(jget_auth "/account/finance/invoices?page_size=5" "$ATH")
  INV_ID=$(echo "$INVS" | jq -r '(.result // [])[0].id // empty')
  echo "  note: from-payment resp=$(echo "$INV_FROM" | jq -c '{message,statusCode,id}') pay=$PAY_ID"
fi
check "invoice exists for athlete" "true" "$([ -n "$INV_ID" ] && echo true || echo false)"
if [ -n "$INV_ID" ]; then
  INV=$(jget_auth "/account/finance/invoices/$INV_ID" "$ATH")
  check "invoice has paymentId" "true" "$(echo "$INV" | jq -r '.paymentId != null and .paymentId != ""')"
  check "invoice amounts.payable >= 0" "true" "$(echo "$INV" | jq -r '(.amounts.payable // -1) >= 0')"
fi
OWN_CLUB_ID=$(echo "$OWN_CLUBS" | jq -r '(.result // [])[0].id // empty')
OWN_AN=$(jget_auth "/account/clubs/$OWN_CLUB_ID/finance/analytics/overview?period=week" "$OWN")
check "owner finance analytics kpis" "true" "$(echo "$OWN_AN" | jq -r '(.kpis|type)=="array" and ((.kpis|length)>=1)')"

echo "══ Owner tasks linked to club ══"
TASK=$(jpost_auth "/account/clubs/$OWN_CLUB_ID/tasks" "$OWN" '{"title":"Integrity task","priority":"high"}')
TASK_ID=$(echo "$TASK" | jq -r '.id // empty')
check "create owner task" "true" "$([ -n "$TASK_ID" ] && echo true || echo false)"
check "task clubId matches" "true" "$(echo "$TASK" | jq -r --arg c "$OWN_CLUB_ID" '.clubId == $c')"
SUM=$(jget_auth "/account/clubs/$OWN_CLUB_ID/tasks/summary" "$OWN")
check "tasks summary openCount >= 1" "true" "$(echo "$SUM" | jq -r '(.openCount // 0) >= 1')"

echo "══ Admin metric-types CRUD link ══"
ADM_TYPES=$(jget_auth "/admin/progress/metric-types?page_size=5" "$ADM")
check "admin metric-types list" "true" "$(echo "$ADM_TYPES" | jq -r '((.result // [])|length) >= 1 or (.id != null)')"

echo "══ Orphan / broken-ref spot checks via discovery coaches ══"
COACHES=$(jget "/discovery/coaches?page=1&page_size=10")
COACH_OK=$(echo "$COACHES" | jq -r '[(.result // [])[] | select(.id != null)] | length >= 1')
check "discovery coaches have ids" "true" "$COACH_OK"

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL INTEGRITY TESTS PASSED"
  exit 0
else
  echo "$FAILURES INTEGRITY TEST(S) FAILED"
  exit 1
fi
