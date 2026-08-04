#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-aab}"
ROOT_DIR="/workspace"
MOBILE_DIR="${ROOT_DIR}/apps/mobile"
ANDROID_DIR="${MOBILE_DIR}/android"
ARTIFACTS_DIR="${MOBILE_DIR}/artifacts/android"

export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export JAVA_HOME="${JAVA_HOME:-/opt/java/openjdk}"
export PATH="${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

cd "${ROOT_DIR}"

# Gradle local.properties (sdk.dir) for environments without Android Studio
printf 'sdk.dir=%s\n' "${ANDROID_HOME}" > "${ANDROID_DIR}/local.properties"

# Optional: mount/copy signing material into the container
if [[ -n "${GYM4ME_UPLOAD_STORE_FILE:-}" ]]; then
  :
elif [[ -f "${ANDROID_DIR}/key.properties" ]]; then
  :
elif [[ -f "/secrets/key.properties" ]]; then
  cp /secrets/key.properties "${ANDROID_DIR}/key.properties"
  if [[ -f /secrets/upload-keystore.jks ]]; then
    cp /secrets/upload-keystore.jks "${ANDROID_DIR}/upload-keystore.jks"
  fi
fi

case "${TARGET}" in
  apk:debug)
    npm run android:apk --workspace=mobile
    ;;
  apk:release|apk)
    npm run android:apk:release --workspace=mobile
    ;;
  aab|aab:release)
    npm run android:aab --workspace=mobile
    ;;
  *)
    echo "Unknown target: ${TARGET}" >&2
    echo "Usage: android-release [apk:debug|apk:release|aab]" >&2
    exit 1
    ;;
esac

echo "Artifacts:"
ls -lah "${ARTIFACTS_DIR}"
