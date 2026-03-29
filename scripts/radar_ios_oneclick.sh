#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_PROJECT="$ROOT_DIR/ios/App/App.xcodeproj"
IOS_WORKDIR="$ROOT_DIR/ios/App"
PUBLIC_DIR="$IOS_WORKDIR/App/public"
BUNDLE_ID="com.heartguide.app"

DEVICE_UDID="${1:-}"
if [[ -z "$DEVICE_UDID" ]]; then
  DEVICE_UDID="$(xcrun xctrace list devices | grep -Eo '[0-9A-F]{8}-[0-9A-F]{16}' | head -n 1)"
fi
if [[ -z "$DEVICE_UDID" ]]; then
  echo "未检测到已连接 iPhone 设备"
  exit 1
fi

echo "使用设备: $DEVICE_UDID"
echo "同步商机雷达前端资源..."
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"
cp -R "$ROOT_DIR/index.html" "$ROOT_DIR/css" "$ROOT_DIR/js" "$ROOT_DIR/assets" "$PUBLIC_DIR"/
touch "$PUBLIC_DIR/cordova.js" "$PUBLIC_DIR/cordova_plugins.js"

echo "执行真机构建..."
xcodebuild \
  -project "$IOS_PROJECT" \
  -scheme App \
  -configuration Debug \
  -destination "id=$DEVICE_UDID" \
  -allowProvisioningUpdates \
  -allowProvisioningDeviceRegistration \
  build

APP_PATH="$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*/Build/Products/Debug-iphoneos/App.app" | tail -n 1)"
if [[ -z "$APP_PATH" ]]; then
  echo "未找到构建产物 App.app"
  exit 1
fi

echo "安装到手机..."
xcrun devicectl device install app --device "$DEVICE_UDID" "$APP_PATH"

echo "拉起 App..."
xcrun devicectl device process launch --device "$DEVICE_UDID" "$BUNDLE_ID" --activate

echo "校验安装结果..."
xcrun devicectl device info apps --device "$DEVICE_UDID" | grep -i "$BUNDLE_ID"
echo "完成：商机雷达已构建、安装并拉起"
