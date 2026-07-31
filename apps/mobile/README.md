# Gym4Me Mobile (Next.js + Capacitor)

Next.js app wrapped with Capacitor for Android / iOS binaries.

## Prerequisites

- Node 18+
- **Android:** Android Studio/SDK + **JDK 21+** (`brew install openjdk@21`)  
  Scripts auto-detect `~/Library/Android/sdk` and Homebrew OpenJDK 21.
- **iOS (macOS):** full Xcode (not only Command Line Tools), CocoaPods  
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  export LANG=en_US.UTF-8
  ```

## Dev (browser)

```bash
npm run dev:mobile
# http://localhost:8081
```

## Capacitor sync

Builds the static Next export (`out/`) and copies it into native projects:

```bash
npm run mobile:cap:sync
# or from apps/mobile:
npm run cap:sync
```

## Build artifacts

Outputs go to `apps/mobile/artifacts/`.

| Target | Command (repo root) | Output |
| --- | --- | --- |
| Android debug APK | `npm run mobile:android:apk` | `artifacts/android/Gym4Me-debug.apk` |
| Android release APK | `npm run android:apk:release --workspace=mobile` | `artifacts/android/Gym4Me-release.apk` |
| Android Play Store AAB | `npm run mobile:android:aab` | `artifacts/android/Gym4Me-release.aab` |
| iOS Simulator `.app` | `npm run mobile:ios:sim` | `artifacts/ios/Gym4Me-simulator.app` |
| iOS archive | `npm run ios:archive --workspace=mobile` | `artifacts/ios/Gym4Me.xcarchive` |
| iOS IPA | `npm run mobile:ios:ipa` | `artifacts/ios/Gym4Me.ipa` |

Open native IDEs:

```bash
npm run mobile:android:open
npm run mobile:ios:open
```

### Signing notes

- **Debug APK** works out of the box.
- **Release APK / AAB** need a keystore configured in `android/app` (Android Studio → Generate Signed Bundle / APK, or `signingConfigs` in Gradle).
- **IPA** needs an Apple Developer team in Xcode and a valid `ios/ExportOptions.plist` (auto-created with `method=development` on first IPA build).

App ID: `com.gym4me.app` (see `capacitor.config.ts`).
