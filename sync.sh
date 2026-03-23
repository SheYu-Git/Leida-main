#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ "${1:-}" == "ios" ]]; then
  shift || true
  exec bash "$ROOT_DIR/sync_preview_to_ios.sh" "$@"
fi

exec bash "$ROOT_DIR/scripts/sync_server.sh"
