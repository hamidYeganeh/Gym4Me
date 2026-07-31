#!/usr/bin/env bash
set -euo pipefail

# CocoaPods requires UTF-8 on macOS
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "→ Building static Next.js export..."
npm run build

echo "→ Syncing Capacitor native projects..."
# Prefer per-platform sync so Android is not blocked by iOS tooling issues
npx cap sync android

if [[ -d ios ]]; then
  if ! npx cap sync ios; then
    echo "iOS sync/pod install failed. Copying web assets only."
    echo "Tip: install full Xcode, then: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    npx cap copy ios || true
  fi
fi

echo "Done. Web assets are in android/ios from out/"
echo "Artifacts from build scripts land in apps/mobile/artifacts/"
