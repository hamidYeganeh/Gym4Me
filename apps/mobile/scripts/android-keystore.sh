#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${ROOT_DIR}/android"
KEYSTORE_PATH="${ANDROID_DIR}/upload-keystore.jks"
KEY_PROPS="${ANDROID_DIR}/key.properties"
ALIAS="${GYM4ME_UPLOAD_KEY_ALIAS:-upload}"
VALIDITY_DAYS="${GYM4ME_KEYSTORE_VALIDITY_DAYS:-10000}"

if [[ -f "${KEYSTORE_PATH}" ]]; then
  echo "Keystore already exists: ${KEYSTORE_PATH}" >&2
  echo "Remove it first if you want to regenerate." >&2
  exit 1
fi

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found. Install JDK 21+ first (brew install openjdk@21)." >&2
  exit 1
fi

STORE_PASSWORD="${GYM4ME_UPLOAD_STORE_PASSWORD:-}"
KEY_PASSWORD="${GYM4ME_UPLOAD_KEY_PASSWORD:-}"

if [[ -z "${STORE_PASSWORD}" ]]; then
  read -r -s -p "Store password: " STORE_PASSWORD
  echo
fi
if [[ -z "${KEY_PASSWORD}" ]]; then
  read -r -s -p "Key password (Enter to reuse store password): " KEY_PASSWORD
  echo
  KEY_PASSWORD="${KEY_PASSWORD:-$STORE_PASSWORD}"
fi

CN="${GYM4ME_KEYSTORE_CN:-Gym4Me}"
OU="${GYM4ME_KEYSTORE_OU:-Mobile}"
O="${GYM4ME_KEYSTORE_O:-Gym4Me}"
L="${GYM4ME_KEYSTORE_L:-Tehran}"
ST="${GYM4ME_KEYSTORE_ST:-Tehran}"
C="${GYM4ME_KEYSTORE_C:-IR}"

keytool -genkeypair \
  -v \
  -storetype JKS \
  -keystore "${KEYSTORE_PATH}" \
  -alias "${ALIAS}" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "${VALIDITY_DAYS}" \
  -storepass "${STORE_PASSWORD}" \
  -keypass "${KEY_PASSWORD}" \
  -dname "CN=${CN}, OU=${OU}, O=${O}, L=${L}, ST=${ST}, C=${C}"

cat > "${KEY_PROPS}" <<EOF
storeFile=upload-keystore.jks
storePassword=${STORE_PASSWORD}
keyAlias=${ALIAS}
keyPassword=${KEY_PASSWORD}
EOF

chmod 600 "${KEYSTORE_PATH}" "${KEY_PROPS}"

echo "Created:"
echo "  ${KEYSTORE_PATH}"
echo "  ${KEY_PROPS}"
echo "Keep these private. Back them up securely — losing them blocks Play Store updates."
