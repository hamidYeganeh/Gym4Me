#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-aab}"
KEY_PROPS="${GYM4ME_KEY_PROPERTIES:-${ROOT_DIR}/apps/mobile/android/key.properties}"
KEYSTORE="${GYM4ME_UPLOAD_KEYSTORE:-${ROOT_DIR}/apps/mobile/android/upload-keystore.jks}"

if [[ ! -f "${KEY_PROPS}" || ! -f "${KEYSTORE}" ]]; then
  echo "Missing signing files." >&2
  echo "  key.properties: ${KEY_PROPS}" >&2
  echo "  keystore:       ${KEYSTORE}" >&2
  echo "Run: npm run mobile:android:keystore" >&2
  exit 1
fi

mkdir -p "${ROOT_DIR}/apps/mobile/artifacts/android"

docker compose --project-directory "${ROOT_DIR}" --profile android run --rm \
  -v "${KEY_PROPS}:/secrets/key.properties:ro" \
  -v "${KEYSTORE}:/secrets/upload-keystore.jks:ro" \
  android-release "${TARGET}"
