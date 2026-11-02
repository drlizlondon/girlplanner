#!/bin/sh
# Usage: PGPORT=55432 supabase/tests/run-opens.sh   (needs a running local Postgres 16; never a live project)
set -e
D=$(cd "$(dirname "$0")" && pwd); M="$D/../migrations"
P="psql -v ON_ERROR_STOP=1 -q -X -p ${PGPORT:-55432} -h 127.0.0.1"
$P -d postgres -c "drop database if exists qm_opens" -c "create database qm_opens" >/dev/null
S="$P -d qm_opens"
$S -f "$D/assistant_keys.stub.sql" -f "$M/20261030090000_assistant_keys.sql" -f "$M/20261102120000_app_opens.sql"
echo "== migrations run twice =="; $S -f "$M/20261030090000_assistant_keys.sql" -f "$M/20261102120000_app_opens.sql" && echo "PASS rerun clean"
$S -f "$D/app_opens.test.sql"
