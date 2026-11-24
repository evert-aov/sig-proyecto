#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PGHOST="${PGHOST:-127.0.0.1}"
export PGPORT="${PGPORT:-5433}"
export PGDATABASE="${PGDATABASE:-sig_uagrm}"
export PGUSER="${PGUSER:-sig_admin}"
export PGPASSWORD="${PGPASSWORD:-sig_uagrm_2026}"
export PGDATA="${PGDATA:-$ROOT_DIR/.pgdata}"
PGLOG="${PGLOG:-$PGDATA/postgresql.log}"
PGSOCK="$PGDATA/run"

if ! command -v pg_ctl >/dev/null 2>&1; then
  echo "Error: pg_ctl no encontrado. Ejecuta dentro de 'nix develop'." >&2
  exit 1
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "Inicializando clúster PostgreSQL en $PGDATA..."
  rm -rf "$PGDATA"
  initdb -D "$PGDATA" -U "$PGUSER" --encoding=UTF8 --locale=C.UTF-8 --auth=trust >/dev/null
  mkdir -p "$PGSOCK"
  cat >> "$PGDATA/postgresql.conf" <<EOF
listen_addresses = '127.0.0.1'
port = $PGPORT
unix_socket_directories = '$PGSOCK'
logging_collector = off
EOF
fi

mkdir -p "$PGSOCK"

if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "PostgreSQL ya está corriendo en $PGHOST:$PGPORT."
else
  echo "Iniciando PostgreSQL en $PGHOST:$PGPORT..."
  pg_ctl -D "$PGDATA" -l "$PGLOG" -o "-k $PGSOCK -p $PGPORT" start
fi

until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" >/dev/null 2>&1; do
  sleep 0.3
done

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 <<SQL >/dev/null
ALTER USER $PGUSER WITH PASSWORD '$PGPASSWORD';
SQL

if ! psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$PGDATABASE'" | grep -q 1; then
  echo "Creando base de datos $PGDATABASE..."
  createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"
fi

echo "PostgreSQL listo en postgresql://$PGUSER@$PGHOST:$PGPORT/$PGDATABASE"
