#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_DIR="${LOCAL_DIR:-$ROOT_DIR}"
REMOTE_USER="${REMOTE_USER:-sheyugroup}"
REMOTE_HOST="${REMOTE_HOST:-120.236.242.37}"
REMOTE_PORT="${REMOTE_PORT:-2222}"
REMOTE_DIR="${REMOTE_DIR:-/Users/sheyugroup/WebServer/app}"

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "本地目录不存在: $LOCAL_DIR"
  exit 1
fi

RSYNC_RSH="ssh -p ${REMOTE_PORT} -o ServerAliveInterval=20 -o ServerAliveCountMax=6"

rsync -avzP --partial \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='ios' \
  --exclude='www' \
  --exclude='preview' \
  --exclude='dist' \
  --exclude='output' \
  --exclude='*.log' \
  --exclude='.env' \
  -e "$RSYNC_RSH" \
  "${LOCAL_DIR}/" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

echo "同步完成: ${LOCAL_DIR} -> ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
