#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_USER="${REMOTE_USER:-sheyugroup}"
REMOTE_HOST="${REMOTE_HOST:-120.236.242.37}"
REMOTE_PORT="${REMOTE_PORT:-2222}"
REMOTE_DIR="${REMOTE_DIR:-/Users/sheyugroup/WebServer/app}"
APP_NAME="${APP_NAME:-leida-api}"

"$ROOT_DIR/scripts/sync_server.sh"

ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "bash -l -c '
set -e
cd $REMOTE_DIR
npm ci
if pm2 describe $APP_NAME >/dev/null 2>&1; then
  pm2 restart $APP_NAME --update-env
else
  pm2 start ./node_modules/.bin/tsx --name $APP_NAME -- api/server.ts
fi
pm2 save
pm2 status $APP_NAME
PORT_VAL=\${PORT:-}
if [ -z \"\$PORT_VAL\" ] && [ -f .env ]; then
  PORT_VAL=\$(grep -E \"^PORT=\" .env | tail -n1 | cut -d= -f2- | tr -d \"\\r\" | tr -d \"\\\"\")
fi
if [ -z \"\$PORT_VAL\" ]; then
  PORT_VAL=3001
fi
ok=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS \"http://127.0.0.1:\$PORT_VAL/api/health\" >/dev/null; then
    ok=1
    break
  fi
  sleep 1
done
if [ \"\$ok\" != \"1\" ]; then
  echo \"health check failed on port \$PORT_VAL\"
  pm2 logs $APP_NAME --lines 80 --nostream || true
  exit 1
fi
curl -fsS \"http://127.0.0.1:\$PORT_VAL/api/health\"
'"
