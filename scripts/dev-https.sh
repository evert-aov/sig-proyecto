#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERTS_DIR="$ROOT_DIR/.certs"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "Error: mkcert no encontrado. Ejecuta dentro de 'nix develop'." >&2
  exit 1
fi

mkdir -p "$CERTS_DIR"

LOCAL_IP="$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -n1 || true)"
HOSTS=("localhost" "127.0.0.1" "::1")
if [ -n "$LOCAL_IP" ]; then
  HOSTS+=("$LOCAL_IP")
fi

echo "Generando certificados HTTPS locales en $CERTS_DIR para: ${HOSTS[*]}"
mkcert -install || true
mkcert -cert-file "$CERTS_DIR/dev-cert.pem" -key-file "$CERTS_DIR/dev-key.pem" "${HOSTS[@]}"

echo "Certificados listos:"
echo "  Cert: $CERTS_DIR/dev-cert.pem"
echo "  Key:  $CERTS_DIR/dev-key.pem"
echo "Para servir Angular por HTTPS en red local (para LocAR.js en celular):"
echo "  cd frontend && npx ng serve --host 0.0.0.0 --ssl --ssl-cert ../.certs/dev-cert.pem --ssl-key ../.certs/dev-key.pem --proxy-config proxy.conf.json"
