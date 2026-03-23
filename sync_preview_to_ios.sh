#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_PROJECT="$ROOT_DIR/ios/App/App.xcodeproj"
IOS_WORKDIR="$ROOT_DIR/ios/App"
PUBLIC_DIR="$IOS_WORKDIR/App/public"
BUNDLE_ID="com.heartguide.app"
DEVELOPMENT_TEAM="${DEVELOPMENT_TEAM:-49U49U43JC}"

DEVICE_UDID="${1:-}"
RESET_APP_DATA="${RESET_APP_DATA:-0}"
if [[ "${2:-}" == "--reset-data" || "${2:-}" == "--clean" ]]; then
  RESET_APP_DATA="1"
fi
if [[ -z "$DEVICE_UDID" ]]; then
  DEVICE_UDID="$(xcrun xctrace list devices | grep -Eo '[0-9A-F]{8}-[0-9A-F]{16}' | head -n 1)"
fi
if [[ -z "$DEVICE_UDID" ]]; then
  echo "未检测到已连接 iPhone 设备"
  exit 1
fi

echo "使用设备: $DEVICE_UDID"
echo "同步本地预览资源..."
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
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
  build

APP_PATH="$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*/Build/Products/Debug-iphoneos/App.app" -print0 | xargs -0 ls -td 2>/dev/null | head -n 1)"
if [[ -z "$APP_PATH" ]]; then
  echo "未找到构建产物 App.app"
  exit 1
fi

LOCAL_JS_SHA="$(shasum -a 1 "$ROOT_DIR/js/app.js" | awk '{print $1}')"
APP_JS_SHA="$(shasum -a 1 "$APP_PATH/public/js/app.js" | awk '{print $1}')"
LOCAL_HTML_SHA="$(shasum -a 1 "$ROOT_DIR/index.html" | awk '{print $1}')"
APP_HTML_SHA="$(shasum -a 1 "$APP_PATH/public/index.html" | awk '{print $1}')"
echo "本地 app.js: $LOCAL_JS_SHA"
echo "产物 app.js: $APP_JS_SHA"
echo "本地 index.html: $LOCAL_HTML_SHA"
echo "产物 index.html: $APP_HTML_SHA"
if [[ "$LOCAL_JS_SHA" != "$APP_JS_SHA" ]]; then
  echo "错误：构建产物与本地预览代码不一致"
  exit 1
fi
if [[ "$LOCAL_HTML_SHA" != "$APP_HTML_SHA" ]]; then
  echo "错误：构建产物与本地首页代码不一致"
  exit 1
fi

echo "安装到手机..."
if [[ "$RESET_APP_DATA" == "1" ]]; then
  echo "已启用重置数据模式：将先卸载 App（会清空本地数据）"
  xcrun devicectl device uninstall app --device "$DEVICE_UDID" "$BUNDLE_ID" || true
else
  echo "保留数据模式：直接覆盖安装，不卸载 App"
fi
xcrun devicectl device install app --device "$DEVICE_UDID" "$APP_PATH"

echo "校验安装版本..."
xcrun devicectl device info apps --device "$DEVICE_UDID" | grep -i "$BUNDLE_ID"

echo "拉起 App..."
if ! xcrun devicectl device process launch --device "$DEVICE_UDID" "$BUNDLE_ID" --activate; then
  echo "提示：请在手机 设置-通用-VPN与设备管理 中信任开发者证书后再打开 App"
fi

echo "完成：本地预览代码已同步到手机"
