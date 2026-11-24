#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PGDATA="${PGDATA:-$ROOT_DIR/.pgdata}"

if [ -d "$PGDATA" ] && pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "Deteniendo PostgreSQL en $PGDATA..."
  pg_ctl -D "$PGDATA" stop -m fast
else
  echo "PostgreSQL no está corriendo."
fi
