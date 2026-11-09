#!/bin/sh
# Usage: PGPORT=55432 supabase/tests/run-completed.sh   (needs a running local Postgres 16; never a live project)
# MIGRATION=path overrides the migration under test (used by the can-fail mutation).
set -e
D=$(cd "$(dirname "$0")" && pwd); M="$D/../migrations"
P="psql -v ON_ERROR_STOP=1 -q -X -p ${PGPORT:-55432} -h 127.0.0.1"
C="${MIGRATION:-$M/20261109090000_completed_today.sql}"
$P -d postgres -c "drop database if exists qm_completed" -c "create database qm_completed" >/dev/null
S="$P -d qm_completed"
$S -f "$D/completed_today.stub.sql" -f "$M/20261030090000_assistant_keys.sql" -f "$M/20261102120000_app_opens.sql" -f "$C"
echo "== migration run twice =="; $S -f "$C" && echo "PASS rerun clean"
$S -f "$D/completed_today.test.sql"
