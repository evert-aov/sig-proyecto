#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PGHOST="${PGHOST:-127.0.0.1}"
export PGPORT="${PGPORT:-5433}"
export PGDATABASE="${PGDATABASE:-sig_uagrm}"
export PGUSER="${PGUSER:-sig_admin}"
export PGPASSWORD="${PGPASSWORD:-sig_uagrm_2026}"

"$ROOT_DIR/scripts/db-start.sh"

echo "Recreando base de datos $PGDATABASE..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 <<SQL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PGDATABASE' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS $PGDATABASE;
CREATE DATABASE $PGDATABASE OWNER $PGUSER;
SQL

for f in "$ROOT_DIR"/database/migrations/*.sql; do
  echo "Ejecutando migración: $(basename "$f")"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$f"
done

for f in "$ROOT_DIR"/database/seeds/*.sql; do
  echo "Ejecutando seed: $(basename "$f")"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$f"
done

echo "Base de datos $PGDATABASE inicializada correctamente."
