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
    "/usr/local/share/android-sdk"; do
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

mkdir -p "${ARTIFACTS_DIR}"
cd "${ANDROID_DIR}"

case "${TARGET}" in
  apk:debug)
    ./gradlew assembleDebug
    SRC="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
    DEST="${ARTIFACTS_DIR}/Gym4Me-debug.apk"
    ;;
  apk:release)
    ./gradlew assembleRelease
    SRC="${ANDROID_DIR}/app/build/outputs/apk/release/app-release-unsigned.apk"
    if [[ ! -f "${SRC}" ]]; then
      SRC="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
    fi
    DEST="${ARTIFACTS_DIR}/Gym4Me-release.apk"
    ;;
  aab|aab:release)
    ./gradlew bundleRelease
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

cp "${SRC}" "${DEST}"
echo "Built: ${DEST}"
