#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="${REMOTE_USER:-sheyugroup}"
REMOTE_HOST="${REMOTE_HOST:-120.236.242.37}"
REMOTE_PORT="${REMOTE_PORT:-2222}"
REMOTE_DIR="${REMOTE_DIR:-/Users/sheyugroup/WebServer/app}"
WAIT_SECONDS="${WAIT_SECONDS:-0}"

ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "bash -l -c '
cd $REMOTE_DIR
echo health:
curl -sS http://127.0.0.1:3001/api/health
echo
echo sync_state:
sqlite3 database.sqlite \"select id,datetime(last_attempt_at/1000,\\\"unixepoch\\\",\\\"localtime\\\"),datetime(last_success_at/1000,\\\"unixepoch\\\",\\\"localtime\\\"),last_page,ifnull(last_error,\\\"\\\") from bidding_sync_state;\"
echo stats_country:
sqlite3 database.sqlite \"select date_key,scope_type,count,total_yi from bidding_daily_stats where scope_type=\\\"country\\\" order by date_key desc limit 3;\"
before=\$(sqlite3 database.sqlite \"select ifnull(last_attempt_at,0) from bidding_sync_state where id=1;\")
echo timer_before:\$before
if [ $WAIT_SECONDS -gt 0 ]; then
  sleep $WAIT_SECONDS
  after=\$(sqlite3 database.sqlite \"select ifnull(last_attempt_at,0) from bidding_sync_state where id=1;\")
  echo timer_after:\$after
  if [ \"\$after\" -gt \"\$before\" ]; then echo timer_result:ok; else echo timer_result:stale; fi
fi
'"
