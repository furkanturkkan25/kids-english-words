#!/usr/bin/env bash
set -euo pipefail
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
export PATH="$DEVELOPER_DIR/usr/bin:$PATH"
cd "$(dirname "$0")"
command -v xcodegen >/dev/null && xcodegen generate
UDID=$(xcrun simctl list devices available | sed -n 's/.*iPhone 17 (\([A-F0-9-]*\)).*/\1/p' | head -1)
xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator
xcodebuild -project KelimeBahcesi.xcodeproj -scheme KelimeBahcesi \
  -destination "platform=iOS Simulator,id=$UDID" \
  -configuration Debug CODE_SIGNING_ALLOWED=NO build
APP=$(find ~/Library/Developer/Xcode/DerivedData -name "KelimeBahcesi.app" -path "*/Debug-iphonesimulator/*" | head -1)
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" com.kelimebahcesi.app
