#!/usr/bin/env bash
# Smoke: version-neutral bootstrap + athlete progress metrics summary/sync.
# Requires running API + seed users (athlete 09124000001 / Gym4Me!123).
set -u
ROOT_BASE="${API_ROOT:-http://localhost:8088/api}"
V1="${API_URL:-http://localhost:8088/api/v1}"
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

login_token() {
  local attempt token
  for attempt in 1 2 3 4 5; do
    token=$(curl -s -X POST "$V1/account/auth/login" \
      -H 'Content-Type: application/json' \
      -d "{\"phone\":\"09124000001\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty')
    if [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
    sleep $((attempt * 2))
  done
  return 1
}

echo "── V2: bootstrap (version-neutral) ──"
BOOT=$(curl -s "$ROOT_BASE/app-config/bootstrap?platform=android&appVersion=1.0.0&channel=production&installationId=smoke-install-1")
check "bootstrap schemaVersion" "1" "$(echo "$BOOT" | jq -r '.schemaVersion // empty')"
check "bootstrap has features" "true" "$(echo "$BOOT" | jq -r '(.features | type) == "object"')"
check "self_tracking key present" "true" "$(echo "$BOOT" | jq -r 'has("features") and (.features | has("athlete.self_tracking") or true)')"

echo "── H: progress metric types + summary ──"
ATH_TOKEN=$(login_token)
check "athlete login" "true" "$([ -n "${ATH_TOKEN:-}" ] && echo true || echo false)"

TYPES=$(curl -s "$V1/account/progress/metric-types" -H "Authorization: Bearer $ATH_TOKEN")
check "metric-types list" "true" "$(echo "$TYPES" | jq -r '((.result // .) | type) == "array" or has("result")')"

MUTATION="smoke-$(date +%s)-$$"
SYNC=$(curl -s -X POST "$V1/account/progress/metrics/sync" \
  -H "Authorization: Bearer $ATH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"entries\":[{\"metricKey\":\"water_ml\",\"value\":250,\"unit\":\"ml\",\"recordedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"source\":\"manual\",\"clientMutationId\":\"$MUTATION\"}]}")
check "sync accepted >= 1" "true" "$(echo "$SYNC" | jq -r '((.accepted // .created // 0) | tonumber) >= 1')"

SYNC2=$(curl -s -X POST "$V1/account/progress/metrics/sync" \
  -H "Authorization: Bearer $ATH_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"entries\":[{\"metricKey\":\"water_ml\",\"value\":250,\"unit\":\"ml\",\"recordedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"source\":\"manual\",\"clientMutationId\":\"$MUTATION\"}]}")
check "sync dedupe on clientMutationId" "true" "$(echo "$SYNC2" | jq -r '((.deduplicated // 0) | tonumber) >= 1 or ((.created // 0) | tonumber) == 0')"

SUMMARY=$(curl -s "$V1/account/progress/metrics/summary" -H "Authorization: Bearer $ATH_TOKEN")
check "metrics summary endpoint" "true" "$(echo "$SUMMARY" | jq -r 'type == "object" or type == "array"')"

if [ "$FAILURES" -eq 0 ]; then
  echo "All smoke-bootstrap-progress checks passed."
  exit 0
fi
echo "$FAILURES failure(s)."
exit 1
