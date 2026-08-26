#!/usr/bin/env bash
# Replica-set integration scenario for workout draft/resume/revision/review.
# Requires seeded demo data, DEBUG_MODE=true and the API running locally.
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
jpost_auth() { curl -s -X POST "$BASE$1" -H 'Content-Type: application/json' -H "Authorization: Bearer $2" -d "$3"; }
jpatch_auth() { curl -s -X PATCH "$BASE$1" -H 'Content-Type: application/json' -H "Authorization: Bearer $2" -d "$3"; }
jget_auth() { curl -s "$BASE$1" -H "Authorization: Bearer $2"; }
token_of() { jq -r '.accessToken // empty'; }

ATH=$(jpost /account/auth/login "{\"phone\":\"09124000001\",\"password\":\"$PASS\"}" | token_of)
COACH_BASE=$(jpost /account/auth/login "{\"phone\":\"09123000001\",\"password\":\"$PASS\"}" | token_of)
COACH=$(jpost_auth /account/auth/switch-role "$COACH_BASE" '{"role":"coach"}' | token_of)
check "athlete authenticated" true "$([ -n "$ATH" ] && echo true || echo false)"
check "coach authenticated" true "$([ -n "$COACH" ] && echo true || echo false)"

ATH_ID=$(jget_auth /account/profile/me "$ATH" | jq -r '.id // empty')
COACH_ID=$(jget_auth /account/profile/me "$COACH" | jq -r '.id // empty')
RELATIONSHIP=$(jget_auth "/account/coaching/students?page_size=50" "$COACH" | jq -r --arg athlete "$ATH_ID" '(.result // [])[] | select(.athleteUserId == $athlete and .status == "active") | .id' | head -1)
check "active coaching relationship found" true "$([ -n "$RELATIONSHIP" ] && echo true || echo false)"

GRANTS=$(jget_auth "/account/data-grants?status=active&page_size=50" "$ATH")
GRANT_ID=$(echo "$GRANTS" | jq -r --arg coach "$COACH_ID" '(.result // [])[] | select(.grantee.userId == $coach and (.scopes | index("workouts.logs"))) | .id' | head -1)
CREATED_GRANT=false
if [ -z "$GRANT_ID" ]; then
  GRANT=$(jpost_auth /account/data-grants "$ATH" "{\"granteeUserId\":\"$COACH_ID\",\"relationshipId\":\"$RELATIONSHIP\",\"scopes\":[\"workouts.logs\"]}")
  GRANT_ID=$(echo "$GRANT" | jq -r '.id // empty')
  CREATED_GRANT=true
fi
check "workout log grant active" true "$([ -n "$GRANT_ID" ] && echo true || echo false)"

EXERCISE_ID=$(jget_auth "/account/progress/exercises?page_size=1" "$ATH" | jq -r '(.result // [])[0].id // empty')
check "exercise available" true "$([ -n "$EXERCISE_ID" ] && echo true || echo false)"

STAMP=$(date +%s)
PROGRAM=$(jpost_auth /account/progress/workout-programs "$COACH" "{\"title\":\"Workout E2E $STAMP\",\"status\":\"published\",\"meta\":{\"focusLabel\":\"integration\",\"weekCount\":1,\"sessionsPerWeek\":1}}")
PROGRAM_ID=$(echo "$PROGRAM" | jq -r '.id // empty')
PLAN=$(jpost_auth "/account/progress/workout-programs/$PROGRAM_ID/assign" "$COACH" "{\"athleteUserId\":\"$ATH_ID\"}")
PLAN_ID=$(echo "$PLAN" | jq -r '.id // empty')
REVISION_ID=$(echo "$PLAN" | jq -r '.currentRevisionId // empty')
check "coach assigns a revisioned plan" true "$([ -n "$PLAN_ID" ] && [ -n "$REVISION_ID" ] && echo true || echo false)"

MUTATION_ID="workout-e2e-$STAMP-0001"
LOG_BODY="{\"planId\":\"$PLAN_ID\",\"planRevisionId\":\"$REVISION_ID\",\"sessionIndex\":0,\"status\":\"draft\",\"sets\":[{\"exerciseId\":\"$EXERCISE_ID\",\"reps\":8,\"weightKg\":40,\"rpe\":7}],\"pain\":{\"score\":2,\"bodyAreaKeys\":[\"knee\"]},\"note\":\"draft\",\"clientMutationId\":\"$MUTATION_ID\"}"
LOG=$(jpost_auth /account/progress/workout-logs "$ATH" "$LOG_BODY")
LOG_ID=$(echo "$LOG" | jq -r '.id // empty')
REPLAY=$(jpost_auth /account/progress/workout-logs "$ATH" "$LOG_BODY")
check "draft persists set/RPE/pain" true "$(echo "$LOG" | jq -r '(.sets[0].rpe == 7) and (.pain.score == 2)')"
check "duplicate create is idempotent" "$LOG_ID" "$(echo "$REPLAY" | jq -r '.id // empty')"

RESUMED=$(jpatch_auth "/account/progress/workout-logs/$LOG_ID" "$ATH" "{\"status\":\"in_progress\",\"sets\":[{\"exerciseId\":\"$EXERCISE_ID\",\"reps\":10,\"weightKg\":42.5,\"rpe\":8}],\"note\":\"resumed\"}")
check "draft resumes with edited set" true "$(echo "$RESUMED" | jq -r '(.status == "in_progress") and (.sets[0].reps == 10) and (.sets[0].rpe == 8)')"

UPDATED_PLAN=$(jpatch_auth "/account/progress/workout-plans/$PLAN_ID" "$COACH" "{\"title\":\"Workout E2E revised $STAMP\"}")
NEW_REVISION_ID=$(echo "$UPDATED_PLAN" | jq -r '.currentRevisionId // empty')
check "coach update appends a new plan revision" true "$([ -n "$NEW_REVISION_ID" ] && [ "$NEW_REVISION_ID" != "$REVISION_ID" ] && echo true || echo false)"

COMPLETED=$(jpost_auth "/account/progress/workout-logs/$LOG_ID/complete" "$ATH" '{}')
COMPLETED_REPLAY=$(jpost_auth "/account/progress/workout-logs/$LOG_ID/complete" "$ATH" '{}')
check "completion is authoritative" completed "$(echo "$COMPLETED" | jq -r '.status // empty')"
check "completion replay is idempotent" completed "$(echo "$COMPLETED_REPLAY" | jq -r '.status // empty')"
check "log remains bound to old revision" "$REVISION_ID" "$(echo "$COMPLETED" | jq -r '.planRevisionId // empty')"

REVIEW_MUTATION="workout-review-$STAMP-0001"
REVIEW=$(jpost_auth "/account/progress/workout-logs/$LOG_ID/reviews" "$COACH" "{\"note\":\"فرم خوب بود؛ جلسه بعد زانو را دوباره بررسی کن.\",\"clientMutationId\":\"$REVIEW_MUTATION\"}")
REVIEW_REPLAY=$(jpost_auth "/account/progress/workout-logs/$LOG_ID/reviews" "$COACH" "{\"note\":\"فرم خوب بود؛ جلسه بعد زانو را دوباره بررسی کن.\",\"clientMutationId\":\"$REVIEW_MUTATION\"}")
check "assigned coach review is visible" 1 "$(echo "$REVIEW" | jq -r '.reviews | length')"
check "review replay does not duplicate" 1 "$(echo "$REVIEW_REPLAY" | jq -r '.reviews | length')"

if [ "$CREATED_GRANT" = true ]; then
  jpost_auth "/account/data-grants/$GRANT_ID/revoke" "$ATH" '{}' >/dev/null
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/account/progress/workout-logs?athleteId=$ATH_ID" -H "Authorization: Bearer $COACH")
  check "revoked grant blocks coach query-time access" 403 "$STATUS"
fi

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL WORKOUT EXECUTION CHECKS PASSED"
  exit 0
fi
echo "$FAILURES WORKOUT EXECUTION CHECK(S) FAILED"
exit 1
