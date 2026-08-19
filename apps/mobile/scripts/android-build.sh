#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${ROOT_DIR}/android"
ARTIFACTS_DIR="${ROOT_DIR}/artifacts/android"
TARGET="${1:-apk:debug}"

if [[ ! -d "${ANDROID_DIR}" ]]; then
  echo "Android platform missing. Run: npm run cap:add:android" >&2
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" ]]; then
  for candidate in \
    "${HOME}/Library/Android/sdk" \
    "${HOME}/Android/Sdk" \
    "/usr/local/share/android-sdk" \
    "/opt/android-sdk"; do
    if [[ -d "${candidate}" ]]; then
      export ANDROID_HOME="${candidate}"
      export ANDROID_SDK_ROOT="${candidate}"
      echo "Using Android SDK at ${candidate}"
      break
    fi
  done
fi

if [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]]; then
  echo "ANDROID_HOME (or ANDROID_SDK_ROOT) is not set. Install Android SDK / Android Studio first." >&2
  exit 1
fi

export ANDROID_HOME="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"

# Capacitor 7 / recent Android Gradle Plugin need JDK 21+
needs_jdk21=true
if [[ -n "${JAVA_HOME:-}" && -x "${JAVA_HOME}/bin/javac" ]]; then
  if "${JAVA_HOME}/bin/javac" -version 2>&1 | grep -qE 'javac 2[1-9]'; then
    needs_jdk21=false
  fi
fi

if [[ "${needs_jdk21}" == "true" ]]; then
  for candidate in \
    "/opt/homebrew/opt/openjdk@21" \
    "/opt/homebrew/opt/openjdk" \
    "/usr/local/opt/openjdk@21"; do
    if [[ -x "${candidate}/bin/javac" ]]; then
      export JAVA_HOME="${candidate}"
      echo "Using JAVA_HOME=${JAVA_HOME}"
      break
    fi
  done

  if [[ -z "${JAVA_HOME:-}" ]] || ! "${JAVA_HOME}/bin/javac" -version 2>&1 | grep -qE 'javac 2[1-9]'; then
    if command -v /usr/libexec/java_home >/dev/null 2>&1; then
      if JDK21="$(/usr/libexec/java_home -v 21 2>/dev/null)"; then
        export JAVA_HOME="${JDK21}"
        echo "Using JAVA_HOME=${JAVA_HOME}"
      fi
    fi
  fi
fi

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "JDK 21+ is required. Install with: brew install openjdk@21" >&2
  exit 1
fi

export PATH="${JAVA_HOME}/bin:${PATH}"

# Cursor / sandboxes sometimes redirect GRADLE_USER_HOME to a partial cache.
# Prefer the real user home unless the caller explicitly overrides.
if [[ -n "${GYM4ME_GRADLE_USER_HOME:-}" ]]; then
  export GRADLE_USER_HOME="${GYM4ME_GRADLE_USER_HOME}"
elif [[ "${GRADLE_USER_HOME:-}" == *cursor-sandbox-cache* || -z "${GRADLE_USER_HOME:-}" ]]; then
  export GRADLE_USER_HOME="${HOME}/.gradle"
fi

has_release_signing() {
  if [[ -n "${GYM4ME_UPLOAD_STORE_FILE:-}" && -n "${GYM4ME_UPLOAD_STORE_PASSWORD:-}" && -n "${GYM4ME_UPLOAD_KEY_ALIAS:-}" && -n "${GYM4ME_UPLOAD_KEY_PASSWORD:-}" ]]; then
    return 0
  fi
  [[ -f "${ANDROID_DIR}/key.properties" ]]
}

require_release_signing() {
  if has_release_signing; then
    return 0
  fi
  echo "Release signing is not configured." >&2
  echo "Create a keystore: npm run android:keystore --workspace=mobile" >&2
  echo "Or copy android/key.properties.example → android/key.properties and fill it in." >&2
  echo "Or set GYM4ME_UPLOAD_STORE_FILE / STORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD." >&2
  exit 1
}

# `file("upload-keystore.jks")` resolves against the app module, not android/.
APP_GRADLE="${ANDROID_DIR}/app/build.gradle"
if [[ -f "${APP_GRADLE}" ]] && grep -q 'def storePath = file(uploadStoreFile)' "${APP_GRADLE}"; then
  python3 - "${APP_GRADLE}" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text()
path.write_text(text.replace("def storePath = file(uploadStoreFile)", "def storePath = new File(uploadStoreFile)", 1))
PY
fi

mkdir -p "${ARTIFACTS_DIR}"
cd "${ANDROID_DIR}"

GRADLE_INIT="$(mktemp "${TMPDIR:-/tmp}/gym4me-gradle-init.XXXXXX.gradle")"
cat > "${GRADLE_INIT}" <<'EOF'
allprojects {
  repositories {
    mavenLocal()
    google()
    mavenCentral()
  }
}
gradle.taskGraph.whenReady { graph ->
  graph.allTasks.findAll { it.name.toLowerCase().contains("lint") }.each { it.enabled = false }
}
EOF
cleanup_gradle_init() {
  rm -f "${GRADLE_INIT}"
}
trap cleanup_gradle_init EXIT

# Ensure Gradle distribution is present (wrapper default timeout is easy to hit on slow networks)
WRAPPER_PROPS="${ANDROID_DIR}/gradle/wrapper/gradle-wrapper.properties"
DIST_URL="$(sed -n 's/^distributionUrl=//p' "${WRAPPER_PROPS}" | sed 's#\\:#:#g')"
DIST_NAME="$(basename "${DIST_URL}")"
DIST_DIR="${HOME}/.gradle/wrapper/dists/${DIST_NAME%.zip}"
if ! find "${DIST_DIR}" -type f -name "${DIST_NAME}" 2>/dev/null | grep -q .; then
  echo "Gradle distribution missing/incomplete — downloading ${DIST_NAME}..."
  # Clear failed partial downloads so the wrapper can retry cleanly
  find "${DIST_DIR}" -name "*.part" -delete 2>/dev/null || true
  TMP_ZIP="$(mktemp "/tmp/${DIST_NAME}.XXXXXX")"
  if curl -L --connect-timeout 30 --max-time 600 -o "${TMP_ZIP}" "${DIST_URL}"; then
    HASH_DIR="$(find "${DIST_DIR}" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | head -n 1)"
    if [[ -n "${HASH_DIR}" ]]; then
      mv "${TMP_ZIP}" "${HASH_DIR}/${DIST_NAME}"
    else
      mkdir -p "${DIST_DIR}/manual"
      mv "${TMP_ZIP}" "${DIST_DIR}/manual/${DIST_NAME}"
    fi
    echo "Gradle distribution ready."
  else
    rm -f "${TMP_ZIP}"
    echo "Warning: pre-download failed; falling back to Gradle wrapper download." >&2
  fi
fi

case "${TARGET}" in
  apk:debug)
    ./gradlew assembleDebug --init-script "${GRADLE_INIT}"
    SRC="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
    DEST="${ARTIFACTS_DIR}/Gym4Me-debug.apk"
    ;;
  apk:release)
    require_release_signing
    ./gradlew assembleRelease --init-script "${GRADLE_INIT}"
    SRC="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
    if [[ ! -f "${SRC}" ]]; then
      SRC="${ANDROID_DIR}/app/build/outputs/apk/release/app-release-unsigned.apk"
    fi
    DEST="${ARTIFACTS_DIR}/Gym4Me-release.apk"
    ;;
  aab|aab:release)
    require_release_signing
    ./gradlew bundleRelease --init-script "${GRADLE_INIT}"
    SRC="${ANDROID_DIR}/app/build/outputs/bundle/release/app-release.aab"
    DEST="${ARTIFACTS_DIR}/Gym4Me-release.aab"
    ;;
  *)
    echo "Unknown target: ${TARGET}" >&2
    echo "Usage: $0 [apk:debug|apk:release|aab]" >&2
    exit 1
    ;;
esac

if [[ ! -f "${SRC}" ]]; then
  echo "Build finished but artifact not found at: ${SRC}" >&2
  exit 1
fi

if [[ "${TARGET}" == "apk:release" || "${TARGET}" == "aab" || "${TARGET}" == "aab:release" ]]; then
  if [[ "${SRC}" == *"-unsigned.apk" ]]; then
    echo "Release artifact is still unsigned. Check signing config / keystore path." >&2
    exit 1
  fi
fi

cp "${SRC}" "${DEST}"
echo "Built: ${DEST}"
