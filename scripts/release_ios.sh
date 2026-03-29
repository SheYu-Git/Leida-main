#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_PROJECT="$ROOT_DIR/ios/App/App.xcodeproj"
IOS_WORKDIR="$ROOT_DIR/ios/App"
PUBLIC_DIR="$IOS_WORKDIR/App/public"
BUNDLE_ID="com.heartguide.app"
EXPORT_OPTIONS="${EXPORT_OPTIONS:-$ROOT_DIR/scripts/exportOptions-development.plist}"
OUTPUT_DIR="${OUTPUT_DIR:-$HOME/Desktop/BiddingRadar-release}"
DEVICE_UDID="${1:-}"
RESET_APP_DATA="${RESET_APP_DATA:-0}"
if [[ "${2:-}" == "--reset-data" || "${2:-}" == "--clean" ]]; then
  RESET_APP_DATA="1"
fi
XCODEBUILD="env SWIFTPM_DISABLE_SANDBOX=1 xcodebuild"

if [[ ! -f "$IOS_PROJECT/project.pbxproj" ]]; then
  echo "错误：未找到 iOS 工程文件"
  exit 1
fi

if [[ ! -f "$EXPORT_OPTIONS" ]]; then
  echo "错误：未找到导出配置 $EXPORT_OPTIONS"
  exit 1
fi

MARKETING_VERSION="$(grep -m1 'MARKETING_VERSION = ' "$IOS_PROJECT/project.pbxproj" | sed -E 's/.*MARKETING_VERSION = ([^;]+);/\1/')"
BUILD_VERSION="$(grep -m1 'CURRENT_PROJECT_VERSION = ' "$IOS_PROJECT/project.pbxproj" | sed -E 's/.*CURRENT_PROJECT_VERSION = ([^;]+);/\1/')"
if [[ -z "$MARKETING_VERSION" || -z "$BUILD_VERSION" ]]; then
  echo "错误：无法读取版本号"
  exit 1
fi
RELEASE_TAG="v${MARKETING_VERSION}-${BUILD_VERSION}"

if [[ -z "$DEVICE_UDID" ]]; then
  DEVICE_UDID="$(xcrun xctrace list devices | grep -Eo '[0-9A-F]{8}-[0-9A-F]{16}' | head -n 1 || true)"
fi

echo "发布版本: $RELEASE_TAG"
if [[ -n "$DEVICE_UDID" ]]; then
  echo "真机设备: $DEVICE_UDID"
else
  echo "真机设备: 未检测到，跳过安装步骤"
fi

echo "步骤1/7: 同步前端资源到 iOS 容器"
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"
cp -R "$ROOT_DIR/index.html" "$ROOT_DIR/css" "$ROOT_DIR/js" "$ROOT_DIR/assets" "$PUBLIC_DIR"/
touch "$PUBLIC_DIR/cordova.js" "$PUBLIC_DIR/cordova_plugins.js"

echo "步骤2/7: 计算同步前源码哈希"
LOCAL_JS_SHA="$(shasum -a 1 "$ROOT_DIR/js/app.js" | awk '{print $1}')"
echo "源码 app.js: $LOCAL_JS_SHA"

echo "步骤3/7: Debug clean build"
if [[ -n "$DEVICE_UDID" ]]; then
  $XCODEBUILD \
    -project "$IOS_PROJECT" \
    -scheme App \
    -configuration Debug \
    -destination "id=$DEVICE_UDID" \
    -disableAutomaticPackageResolution \
    -onlyUsePackageVersionsFromResolvedFile \
    clean build
else
  $XCODEBUILD \
    -project "$IOS_PROJECT" \
    -scheme App \
    -configuration Debug \
    -destination "generic/platform=iOS" \
    -disableAutomaticPackageResolution \
    -onlyUsePackageVersionsFromResolvedFile \
    clean build
fi

APP_PATH="$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*/Build/Products/Debug-iphoneos/App.app" | tail -n 1)"
if [[ -z "$APP_PATH" ]]; then
  echo "错误：未找到 Debug 产物 App.app"
  exit 1
fi
APP_JS_SHA="$(shasum -a 1 "$APP_PATH/public/js/app.js" | awk '{print $1}')"
echo "产物 app.js: $APP_JS_SHA"
if [[ "$LOCAL_JS_SHA" != "$APP_JS_SHA" ]]; then
  echo "错误：源码与真机产物代码不一致"
  exit 1
fi

if [[ -n "$DEVICE_UDID" ]]; then
  echo "步骤4/7: 安装真机"
  if [[ "$RESET_APP_DATA" == "1" ]]; then
    echo "重置数据模式：先卸载 App（会清空本地数据）"
    xcrun devicectl device uninstall app --device "$DEVICE_UDID" "$BUNDLE_ID" || true
  else
    echo "保留数据模式：直接覆盖安装，不卸载 App"
  fi
  xcrun devicectl device install app --device "$DEVICE_UDID" "$APP_PATH"
  echo "步骤5/7: 校验真机版本"
  xcrun devicectl device info apps --device "$DEVICE_UDID" | grep -i "$BUNDLE_ID"
  echo "步骤6/7: 拉起 App"
  if ! xcrun devicectl device process launch --device "$DEVICE_UDID" "$BUNDLE_ID" --activate; then
    echo "提示：请在手机 设置-通用-VPN与设备管理 中信任开发者证书"
  fi
fi

echo "步骤7/7: 归档并导出 IPA"
ARCHIVE_PATH="/tmp/BiddingRadar-${RELEASE_TAG}.xcarchive"
EXPORT_PATH="/tmp/BiddingRadar-${RELEASE_TAG}-export"
IPA_NAME="商机雷达-${RELEASE_TAG}.ipa"
rm -rf "$ARCHIVE_PATH" "$EXPORT_PATH"
$XCODEBUILD \
  -project "$IOS_PROJECT" \
  -scheme App \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH" \
  archive
$XCODEBUILD \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS"

if [[ ! -f "$EXPORT_PATH/App.ipa" ]]; then
  echo "错误：未生成 IPA"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
cp -f "$EXPORT_PATH/App.ipa" "$OUTPUT_DIR/$IPA_NAME"
echo "完成：$OUTPUT_DIR/$IPA_NAME"
echo "一致性校验：通过"
