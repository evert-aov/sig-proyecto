{
  description = "SIG UAGRM 2026-2 (Grupo 16: Centros Internos) - NixOS dev environment";

  inputs = {
    nixpkgs.url = "nixpkgs";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      pgWithExtensions = pkgs.postgresql_18.withPackages (ps: [
        ps.postgis
        ps.pgrouting
      ]);
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        name = "sig-uagrm-2026";
        packages = [
          pgWithExtensions
          pkgs.gdal
          pkgs.nodejs_24
          pkgs.mkcert
          pkgs.jq
        ];

        shellHook = ''
          export PGHOST="127.0.0.1"
          export PGPORT="5433"
          export PGDATABASE="sig_uagrm"
          export PGUSER="sig_admin"
          export PGPASSWORD="sig_uagrm_2026"
          export PGDATA="$PWD/.pgdata"
          export PGLOG="$PWD/.pgdata/postgresql.log"
          export DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE"

          echo "=== SIG UAGRM 2026-2 (Grupo 16 - Centros Internos) ==="
          echo "PostgreSQL + PostGIS + pgRouting: $(postgres --version)"
          echo "GDAL: $(ogr2ogr --version)"
          echo "Node.js: $(node --version)"
          echo "BD local: $PGHOST:$PGPORT/$PGDATABASE (usuario: $PGUSER)"
          echo "Comandos: ./scripts/db-start.sh | ./scripts/db-reset.sh | ./scripts/db-stop.sh"
        '';
      };
    };
}
