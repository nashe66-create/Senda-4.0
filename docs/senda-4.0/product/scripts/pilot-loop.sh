#!/usr/bin/env bash
# Senda 4.0 — wedge pilot loop via Connect sandbox (validate → instruct → confirm).
# Requires: apps/web running (default http://localhost:3000), DB migrated + seeded.
#
# Usage:
#   bash docs/senda-4.0/product/scripts/pilot-loop.sh
#   bash docs/senda-4.0/product/scripts/pilot-loop.sh --mismatch
#
# Env overrides:
#   BASE_URL=http://localhost:3000
#   SANDBOX_API_KEY=sk_sandbox_partner_demo
#   LINK_CODE=HDA-ADA-001
#   OBLIGATION_ID=obl_001
#   AMOUNT=850.00
#   DESTINATION_TYPE=bank_usd

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_KEY="${SANDBOX_API_KEY:-sk_sandbox_partner_demo}"
AMOUNT="${AMOUNT:-850.00}"
DESTINATION_TYPE="${DESTINATION_TYPE:-bank_usd}"
MISMATCH=0

for arg in "$@"; do
  case "$arg" in
    --mismatch) MISMATCH=1 ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
  esac
done

# Defaults: Ada for happy path; Ben for mismatch so a prior happy run on Ada still works.
# Override with LINK_CODE / OBLIGATION_ID. Bill must still be open.
if [[ $MISMATCH -eq 1 ]]; then
  LINK_CODE="${LINK_CODE:-HDA-BEN-002}"
  OBLIGATION_ID="${OBLIGATION_ID:-obl_002}"
else
  LINK_CODE="${LINK_CODE:-HDA-ADA-001}"
  OBLIGATION_ID="${OBLIGATION_ID:-obl_001}"
fi

AUTH="Authorization: Bearer ${API_KEY}"
RETRY_KEY="pilot-script-$(date +%s)"

echo "== Senda pilot loop =="
echo "Base: ${BASE_URL}"
echo "Pay code: ${LINK_CODE} · bill: ${OBLIGATION_ID} · ${AMOUNT} USD · ${DESTINATION_TYPE}"
echo "Path: $([[ $MISMATCH -eq 1 ]] && echo 'mismatch / needs a check' || echo 'happy / confirmed')"
echo "Note: sandbox partner confirm — not a live bank webhook."
echo

echo "-- validate"
VALIDATE=$(curl -sS -X POST "${BASE_URL}/api/v1/connect/validate" \
  -H "${AUTH}" \
  -H "content-type: application/json" \
  -d "{\"link_code\":\"${LINK_CODE}\",\"obligation_id\":\"${OBLIGATION_ID}\",\"amount\":\"${AMOUNT}\",\"destination_type\":\"${DESTINATION_TYPE}\"}")
echo "${VALIDATE}" | head -c 400
echo
echo

echo "-- instruct (retry_key=${RETRY_KEY})"
INSTRUCT=$(curl -sS -X POST "${BASE_URL}/api/v1/connect/instruct" \
  -H "${AUTH}" \
  -H "content-type: application/json" \
  -d "{\"link_code\":\"${LINK_CODE}\",\"obligation_id\":\"${OBLIGATION_ID}\",\"amount\":\"${AMOUNT}\",\"retry_key\":\"${RETRY_KEY}\",\"destination_type\":\"${DESTINATION_TYPE}\"}")
echo "${INSTRUCT}"
echo

ATTEMPT_ID=$(echo "${INSTRUCT}" | sed -n 's/.*"attempt_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
CUSTOMER_REF=$(echo "${INSTRUCT}" | sed -n 's/.*"customer_reference"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
CURRENCY=$(echo "${INSTRUCT}" | sed -n 's/.*"currency"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
INSTRUCTED_AMOUNT=$(echo "${INSTRUCT}" | sed -n 's/.*"amount"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

if [[ -z "${ATTEMPT_ID}" || -z "${CUSTOMER_REF}" ]]; then
  echo "ERROR: instruct did not return attempt_id / customer_reference. Is the app seeded and the API key correct?" >&2
  exit 1
fi

CONFIRM_AMOUNT="${INSTRUCTED_AMOUNT:-$AMOUNT}"
if [[ $MISMATCH -eq 1 ]]; then
  # Deliberate wrong amount (same trick as dogfood mismatch) — needs a check, no proof.
  CONFIRM_AMOUNT=$(awk -v a="${CONFIRM_AMOUNT}" 'BEGIN { printf "%.2f", a - 50 }')
fi

echo "-- confirm (sandbox stub; amount=${CONFIRM_AMOUNT})"
CONFIRM=$(curl -sS -X POST "${BASE_URL}/api/v1/connect/confirm" \
  -H "${AUTH}" \
  -H "content-type: application/json" \
  -d "{\"attempt_id\":\"${ATTEMPT_ID}\",\"customer_reference\":\"${CUSTOMER_REF}\",\"amount\":\"${CONFIRM_AMOUNT}\",\"currency\":\"${CURRENCY:-USD}\",\"partner_payment_id\":\"PILOT-SCRIPT-$(date +%s)\"}")
echo "${CONFIRM}"
echo

echo "-- bursar handoff summary"
HANDOFF=$(curl -sS "${BASE_URL}/api/v1/pilot/handoff?attempt_id=${ATTEMPT_ID}")
echo "${HANDOFF}"
echo
echo "Next: open ${BASE_URL}/biller (bursar@heritage-demo.zw / pilot) → Payment status."
echo "Proof download (after login): ${BASE_URL}/api/v1/biller/proofs/${ATTEMPT_ID}"
