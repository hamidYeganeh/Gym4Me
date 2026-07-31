#!/usr/bin/env bash
set -euo pipefail

# CocoaPods requires UTF-8
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="${ROOT_DIR}/ios"
ARTIFACTS_DIR="${ROOT_DIR}/artifacts/ios"
TARGET="${1:-simulator}"
SCHEME="${IOS_SCHEME:-App}"
WORKSPACE="${IOS_DIR}/App/App.xcworkspace"
PROJECT="${IOS_DIR}/App/App.xcodeproj"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "iOS builds require macOS with Xcode." >&2
  exit 1
fi

if [[ ! -d "${IOS_DIR}" ]]; then
  echo "iOS platform missing. Run: npm run cap:add:ios" >&2
  exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild not found. Install Xcode from the App Store." >&2
  exit 1
fi

if xcodebuild -version 2>&1 | grep -q "requires Xcode"; then
  echo "Active developer directory is Command Line Tools only." >&2
  echo "Run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer" >&2
  exit 1
fi

mkdir -p "${ARTIFACTS_DIR}"

if [[ -d "${IOS_DIR}/App/Pods" ]] || [[ -f "${IOS_DIR}/App/Podfile" ]]; then
  if command -v pod >/dev/null 2>&1; then
    (cd "${IOS_DIR}/App" && pod install)
  else
    echo "CocoaPods (pod) not found. Install with: sudo gem install cocoapods" >&2
    exit 1
  fi
fi

BUILD_ROOT="${ARTIFACTS_DIR}/build"
ARCHIVE_PATH="${ARTIFACTS_DIR}/Gym4Me.xcarchive"
EXPORT_PATH="${ARTIFACTS_DIR}/export"

XCODE_TARGET=()
if [[ -d "${WORKSPACE}" ]]; then
  XCODE_TARGET=(-workspace "${WORKSPACE}")
elif [[ -d "${PROJECT}" ]]; then
  XCODE_TARGET=(-project "${PROJECT}")
else
  echo "Neither App.xcworkspace nor App.xcodeproj found under ios/App." >&2
  exit 1
fi

case "${TARGET}" in
  simulator|sim)
    xcodebuild \
      "${XCODE_TARGET[@]}" \
      -scheme "${SCHEME}" \
      -configuration Debug \
      -sdk iphonesimulator \
      -derivedDataPath "${BUILD_ROOT}" \
      build

    APP_PATH="$(find "${BUILD_ROOT}" -type d -name "*.app" | head -n 1)"
    if [[ -z "${APP_PATH}" ]]; then
      echo "Simulator build finished but .app was not found." >&2
      exit 1
    fi
    DEST="${ARTIFACTS_DIR}/Gym4Me-simulator.app"
    rm -rf "${DEST}"
    cp -R "${APP_PATH}" "${DEST}"
    echo "Built: ${DEST}"
    ;;
  device|archive)
    xcodebuild \
      "${XCODE_TARGET[@]}" \
      -scheme "${SCHEME}" \
      -configuration Release \
      -sdk iphoneos \
      -archivePath "${ARCHIVE_PATH}" \
      archive

    echo "Archive created: ${ARCHIVE_PATH}"
    echo "Open Xcode to export IPA (Product > Archive), or provide an ExportOptions.plist and re-run with: npm run ios:ipa"
    ;;
  ipa)
    EXPORT_OPTIONS="${ROOT_DIR}/ios/ExportOptions.plist"
    if [[ ! -f "${EXPORT_OPTIONS}" ]]; then
      cat > "${EXPORT_OPTIONS}" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>development</string>
  <key>signingStyle</key>
  <string>automatic</string>
</dict>
</plist>
PLIST
      echo "Created ${EXPORT_OPTIONS} (method=development). Adjust for App Store / ad-hoc as needed."
    fi

    if [[ ! -d "${ARCHIVE_PATH}" ]]; then
      echo "No archive found. Building archive first..."
      "$0" archive
    fi

    rm -rf "${EXPORT_PATH}"
    xcodebuild \
      -exportArchive \
      -archivePath "${ARCHIVE_PATH}" \
      -exportPath "${EXPORT_PATH}" \
      -exportOptionsPlist "${EXPORT_OPTIONS}"

    IPA_PATH="$(find "${EXPORT_PATH}" -type f -name "*.ipa" | head -n 1)"
    if [[ -z "${IPA_PATH}" ]]; then
      echo "Export finished but .ipa was not found in ${EXPORT_PATH}" >&2
      exit 1
    fi
    DEST="${ARTIFACTS_DIR}/Gym4Me.ipa"
    cp "${IPA_PATH}" "${DEST}"
    echo "Built: ${DEST}"
    ;;
  *)
    echo "Unknown target: ${TARGET}" >&2
    echo "Usage: $0 [simulator|archive|ipa]" >&2
    exit 1
    ;;
esac
