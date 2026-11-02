#!/bin/sh
# Usage: PGPORT=55432 supabase/tests/run-local.sh   (needs a running local Postgres 16; never a live project)
set -e
D=$(cd "$(dirname "$0")" && pwd); M="$D/../migrations"
P="psql -v ON_ERROR_STOP=1 -q -X -p ${PGPORT:-55432} -h 127.0.0.1"
for t in keys suggestions; do
  $P -d postgres -c "drop database if exists qm_$t" -c "create database qm_$t" >/dev/null
done
$P -d qm_keys -f "$D/assistant_keys.stub.sql" -f "$M/20261030090000_assistant_keys.sql" -f "$D/assistant_keys.test.sql"
S="$P -d qm_suggestions"
$S -f "$D/assistant_suggestions.stub.sql" -f "$M/20261030090000_assistant_keys.sql" -f "$M/20261102100000_assistant_suggestions.sql"
echo "== migrations run twice =="; $S -f "$M/20261030090000_assistant_keys.sql" -f "$M/20261102100000_assistant_suggestions.sql" && echo "PASS rerun clean"
$S -f "$D/assistant_suggestions.test.sql"
