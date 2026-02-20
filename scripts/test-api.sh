#!/usr/bin/env bash
# Finder API tests - 5 endpoints (Swagger paths)
# Usage: ./scripts/test-api.sh [BASE_URL]
# Default: https://finder.terangacode.com/api
#
# Flow: Register fresh user (so login has valid creds) → Login → Suggestions
BASE="${1:-https://finder.terangacode.com/api}"
PASS=0 FAIL=0

test_get() {
  local path=$1
  local s=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$path" -H "Accept: application/json")
  if [ "$s" = "200" ]; then
    echo "GET /$path    PASS ($s)"
    PASS=$((PASS + 1))
  else
    echo "GET /$path    FAIL ($s)"
    FAIL=$((FAIL + 1))
  fi
}

test_post() {
  local path=$1 payload=$2 accept_extra=$3
  local s=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/$path" \
    -H "Accept: application/json" -H "Content-Type: application/json" -d "$payload")
  local ok=0
  if [ "$s" = "200" ] || [ "$s" = "201" ]; then ok=1; fi
  if [ -n "$accept_extra" ] && [ "$s" = "422" ]; then ok=1; fi
  if [ $ok -eq 1 ]; then
    echo "POST /$path PASS ($s)"
    PASS=$((PASS + 1))
  else
    echo "POST /$path FAIL ($s)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "Finder API — $BASE"
echo ""

test_get "industries"
test_get "stages"

# Register fresh user (201=created, 422=user exists); include password_confirmation (Laravel expects it)
ts=$(date +%s)
email="e2etest${ts}@finder.test"
reg_payload="{\"name\":\"Test User\",\"email\":\"$email\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}"
test_post "auth/register" "$reg_payload" "422"

# Login with same creds (valid because we just registered)
login_payload="{\"email\":\"$email\",\"password\":\"password123\"}"
test_post "auth/login" "$login_payload"

# Suggestions (public)
test_post "opportunity-suggestions" '{"grant_name":"Test Grant","url":"https://example.com","description":"Test description"}'

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -gt 0 ] && exit 1
exit 0
