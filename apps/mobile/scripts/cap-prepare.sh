#!/usr/bin/env bash
set -euo pipefail

# CocoaPods requires UTF-8 on macOS
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLATFORM="${1:-all}"
cd "${ROOT_DIR}"

echo "→ Building static Next.js export..."
npm run build

echo "→ Syncing Capacitor native projects (${PLATFORM})..."

sync_android() {
  npx cap sync android
}

sync_ios() {
  if [[ ! -d ios ]]; then
    echo "iOS platform missing. Run: npm run cap:add:ios"
    return 0
  fi
  if ! npx cap sync ios; then
    echo "iOS sync/pod install failed. Copying web assets only."
    echo "Tip: install full Xcode, then: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    npx cap copy ios || true
  fi
}

case "${PLATFORM}" in
  android)
    sync_android
    ;;
  ios)
    sync_ios
    ;;
  all|*)
    sync_android
    sync_ios
    ;;
esac

echo "Done. Web assets are in android/ios from out/"
echo "Artifacts from build scripts land in apps/mobile/artifacts/"
