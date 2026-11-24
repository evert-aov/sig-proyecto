#!/usr/bin/env bash
set -euo pipefail

# ETL para importar Shapefiles (plantilla de 10 caracteres del modelo común) o GeoPackage de QGIS/QField
# Uso:
#   ./database/etl/import_shapefiles.sh <directorio_o_gpkg> [capas_separadas_por_coma]
# Ejemplo:
#   ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg
#   ./database/etl/import_shapefiles.sh qgis/sig_uagrm_centros_internos.gpkg sede,edificio

TARGET="${1:-}"
CAPAS_FILTRO="${2:-sede,edificio,ambiente,punto_interes,area,via}"
if [ -z "$TARGET" ]; then
  echo "Uso: $0 <archivo.gpkg | directorio_con_shapefiles> [capas]" >&2
  exit 1
fi

export PGHOST="${PGHOST:-127.0.0.1}"
export PGPORT="${PGPORT:-5433}"
export PGDATABASE="${PGDATABASE:-sig_uagrm}"
export PGUSER="${PGUSER:-sig_admin}"
export PGPASSWORD="${PGPASSWORD:-sig_uagrm_2026}"

if ! command -v ogr2ogr >/dev/null 2>&1; then
  echo "Error: ogr2ogr no encontrado. Ejecuta dentro de 'nix develop'." >&2
  exit 1
fi

PG_CONN="PG:host=$PGHOST port=$PGPORT dbname=$PGDATABASE user=$PGUSER password=$PGPASSWORD"

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 <<SQL
CREATE SCHEMA IF NOT EXISTS staging_etl;
DROP TABLE IF EXISTS staging_etl.sede CASCADE;
DROP TABLE IF EXISTS staging_etl.unidad CASCADE;
DROP TABLE IF EXISTS staging_etl.edificio CASCADE;
DROP TABLE IF EXISTS staging_etl.ambiente CASCADE;
DROP TABLE IF EXISTS staging_etl.punto_interes CASCADE;
DROP TABLE IF EXISTS staging_etl.area CASCADE;
DROP TABLE IF EXISTS staging_etl.via CASCADE;
SQL

cargar_capa() {
  local capa="$1"
  local geom_type="$2"

  if [[ ",$CAPAS_FILTRO," != *",$capa,"* ]]; then
    return 0
  fi

  if [ -f "$TARGET" ]; then
    if ogrinfo -q "$TARGET" "$capa" >/dev/null 2>&1; then
      echo "Cargando capa '$capa' desde GeoPackage..."
      ogr2ogr -f PostgreSQL "$PG_CONN" "$TARGET" "$capa" \
        -nln "staging_etl.$capa" -t_srs EPSG:4326 -nlt "$geom_type" -overwrite -lco GEOMETRY_NAME=geom
    fi
  elif [ -d "$TARGET" ]; then
    local shp="$TARGET/$capa.shp"
    if [ -f "$shp" ]; then
      echo "Cargando shapefile '$shp'..."
      ogr2ogr -f PostgreSQL "$PG_CONN" "$shp" \
        -nln "staging_etl.$capa" -t_srs EPSG:4326 -nlt "$geom_type" -overwrite -lco GEOMETRY_NAME=geom
    fi
  fi
}

cargar_capa "sede" "MULTIPOLYGON"
cargar_capa "edificio" "MULTIPOLYGON"
cargar_capa "ambiente" "POINT"
cargar_capa "punto_interes" "POINT"
cargar_capa "area" "MULTIPOLYGON"
cargar_capa "via" "LINESTRING"

if [ -d "$TARGET" ] && [ -f "$TARGET/unidad.csv" ]; then
  echo "Cargando CSV unidad..."
  ogr2ogr -f PostgreSQL "$PG_CONN" "$TARGET/unidad.csv" -nln "staging_etl.unidad" -overwrite
fi

echo "Transformando códigos -> IDs e insertando en esquema public..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  -- Helper inline: convertir booleano S/N/true/1
  IF to_regclass('staging_etl.sede') IS NOT NULL THEN
    INSERT INTO public.sede (codigo, nombre, tipo, municipio, direccion, geom, grupo_id)
    SELECT
      upper(trim(codigo)),
      nombre,
      COALESCE(NULLIF(lower(trim(tipo)), ''), 'campus'),
      COALESCE(NULLIF(trim(municipio), ''), 'Santa Cruz de la Sierra'),
      NULLIF(trim(direccion), ''),
      ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3)),
      COALESCE(NULLIF(regexp_replace(COALESCE(grupo::text, ''), '[^0-9]', '', 'g'), '')::smallint, 16)
    FROM staging_etl.sede
    WHERE codigo IS NOT NULL
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      tipo = EXCLUDED.tipo,
      municipio = EXCLUDED.municipio,
      direccion = EXCLUDED.direccion,
      geom = EXCLUDED.geom;
  END IF;

  IF to_regclass('staging_etl.edificio') IS NOT NULL THEN
    INSERT INTO public.edificio (codigo, nombre, alias, uso, pisos, ascensor, descripcion, geom, sede_id, grupo_id)
    SELECT
      upper(trim(e.codigo)),
      e.nombre,
      CASE WHEN NULLIF(trim(e.alias::text), '') IS NULL THEN '{}' ELSE string_to_array(replace(trim(e.alias::text), '; ', ';'), ';') END,
      COALESCE(NULLIF(lower(trim(e.uso)), ''), 'academico'),
      GREATEST(1, COALESCE(e.pisos::smallint, 1)),
      upper(trim(COALESCE(e.ascensor::text, 'N'))) IN ('S', 'SI', 'TRUE', 'T', '1', 'Y'),
      NULLIF(trim(COALESCE(e.descrip::text, '')), ''),
      ST_Multi(ST_CollectionExtract(ST_MakeValid(e.geom), 3)),
      s.id,
      COALESCE(NULLIF(regexp_replace(COALESCE(e.grupo::text, ''), '[^0-9]', '', 'g'), '')::smallint, 16)
    FROM staging_etl.edificio e
    JOIN public.sede s ON s.codigo = upper(trim(e.sede))
    WHERE e.codigo IS NOT NULL
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      alias = EXCLUDED.alias,
      uso = EXCLUDED.uso,
      pisos = EXCLUDED.pisos,
      ascensor = EXCLUDED.ascensor,
      descripcion = EXCLUDED.descripcion,
      geom = EXCLUDED.geom,
      sede_id = EXCLUDED.sede_id;
  END IF;

  IF to_regclass('staging_etl.ambiente') IS NOT NULL THEN
    INSERT INTO public.ambiente (
      codigo, nombre, alias, piso, referencia, encargado, telefono, horario, servicios,
      descripcion, verificado_en, geom, tipo_ambiente_id, unidad_id, edificio_id, sede_id, grupo_id
    )
    SELECT
      upper(trim(a.codigo)),
      a.nombre,
      CASE WHEN NULLIF(trim(a.alias::text), '') IS NULL THEN '{}' ELSE string_to_array(replace(trim(a.alias::text), '; ', ';'), ';') END,
      COALESCE(a.piso::smallint, 0),
      NULLIF(trim(a.referencia), ''),
      NULLIF(trim(a.encargado), ''),
      NULLIF(trim(a.telefono), ''),
      NULLIF(trim(a.horario), ''),
      CASE WHEN NULLIF(trim(a.servicios::text), '') IS NULL THEN '{}' ELSE string_to_array(replace(trim(a.servicios::text), '; ', ';'), ';') END,
      NULLIF(trim(COALESCE(a.descrip::text, '')), ''),
      NULLIF(trim(COALESCE(a.verificado::text, '')), '')::date,
      a.geom,
      ta.id,
      u.id,
      ed.id,
      s.id,
      COALESCE(NULLIF(regexp_replace(COALESCE(a.grupo::text, ''), '[^0-9]', '', 'g'), '')::smallint, 16)
    FROM staging_etl.ambiente a
    JOIN public.tipo_ambiente ta ON ta.codigo = upper(trim(a.tipo))
    LEFT JOIN public.unidad u ON u.codigo = upper(trim(COALESCE(a.unidad, '')))
    LEFT JOIN public.edificio ed ON ed.codigo = upper(trim(COALESCE(a.edificio, '')))
    LEFT JOIN public.sede s ON s.codigo = upper(trim(COALESCE(a.sede, '')))
    WHERE a.codigo IS NOT NULL
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      alias = EXCLUDED.alias,
      piso = EXCLUDED.piso,
      referencia = EXCLUDED.referencia,
      encargado = EXCLUDED.encargado,
      telefono = EXCLUDED.telefono,
      horario = EXCLUDED.horario,
      servicios = EXCLUDED.servicios,
      descripcion = EXCLUDED.descripcion,
      verificado_en = EXCLUDED.verificado_en,
      geom = EXCLUDED.geom,
      tipo_ambiente_id = EXCLUDED.tipo_ambiente_id,
      unidad_id = EXCLUDED.unidad_id,
      edificio_id = EXCLUDED.edificio_id,
      sede_id = EXCLUDED.sede_id;
  END IF;

  IF to_regclass('staging_etl.punto_interes') IS NOT NULL THEN
    INSERT INTO public.punto_interes (
      codigo, nombre, piso, accesible, nota, extintor_agente, extintor_kg, extintor_vence,
      verificado_en, geom, tipo_punto_id, edificio_id, sede_id, grupo_id
    )
    SELECT
      upper(trim(p.codigo)),
      NULLIF(trim(p.nombre), ''),
      COALESCE(p.piso::smallint, 0),
      upper(trim(COALESCE(p.accesible::text, 'N'))) IN ('S', 'SI', 'TRUE', 'T', '1', 'Y'),
      NULLIF(trim(p.nota), ''),
      NULLIF(upper(trim(COALESCE(p.ext_agente, ''))), ''),
      NULLIF(p.ext_kg::text, '')::numeric(4,1),
      NULLIF(trim(COALESCE(p.ext_vence::text, '')), '')::date,
      NULLIF(trim(COALESCE(p.verificado::text, '')), '')::date,
      p.geom,
      tp.id,
      ed.id,
      s.id,
      COALESCE(NULLIF(regexp_replace(COALESCE(p.grupo::text, ''), '[^0-9]', '', 'g'), '')::smallint, 16)
    FROM staging_etl.punto_interes p
    JOIN public.tipo_punto tp ON tp.codigo = upper(trim(p.tipo))
    LEFT JOIN public.edificio ed ON ed.codigo = upper(trim(COALESCE(p.edificio, '')))
    LEFT JOIN public.sede s ON s.codigo = upper(trim(COALESCE(p.sede, '')))
    WHERE p.codigo IS NOT NULL
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      piso = EXCLUDED.piso,
      accesible = EXCLUDED.accesible,
      nota = EXCLUDED.nota,
      extintor_agente = EXCLUDED.extintor_agente,
      extintor_kg = EXCLUDED.extintor_kg,
      extintor_vence = EXCLUDED.extintor_vence,
      verificado_en = EXCLUDED.verificado_en,
      geom = EXCLUDED.geom,
      tipo_punto_id = EXCLUDED.tipo_punto_id,
      edificio_id = EXCLUDED.edificio_id,
      sede_id = EXCLUDED.sede_id;
  END IF;

  IF to_regclass('staging_etl.area') IS NOT NULL THEN
    INSERT INTO public.area (
      codigo, nombre, material, capacidad, acceso, nota, verificado_en, geom,
      tipo_area_id, sede_id, unidad_id, grupo_id
    )
    SELECT
      upper(trim(ar.codigo)),
      NULLIF(trim(ar.nombre), ''),
      NULLIF(lower(trim(COALESCE(ar.material, ''))), ''),
      NULLIF(ar.capacidad::text, '')::smallint,
      COALESCE(NULLIF(lower(trim(ar.acceso)), ''), 'publico'),
      NULLIF(trim(ar.nota), ''),
      NULLIF(trim(COALESCE(ar.verificado::text, '')), '')::date,
      ST_Multi(ST_CollectionExtract(ST_MakeValid(ar.geom), 3)),
      ta.id,
      s.id,
      u.id,
      COALESCE(NULLIF(regexp_replace(COALESCE(ar.grupo::text, ''), '[^0-9]', '', 'g'), '')::smallint, 16)
    FROM staging_etl.area ar
    JOIN public.tipo_area ta ON ta.codigo = upper(trim(ar.tipo))
    LEFT JOIN public.sede s ON s.codigo = upper(trim(COALESCE(ar.sede, '')))
    LEFT JOIN public.unidad u ON u.codigo = upper(trim(COALESCE(ar.unidad, '')))
    WHERE ar.codigo IS NOT NULL
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      material = EXCLUDED.material,
      capacidad = EXCLUDED.capacidad,
      acceso = EXCLUDED.acceso,
      nota = EXCLUDED.nota,
      verificado_en = EXCLUDED.verificado_en,
      geom = EXCLUDED.geom,
      tipo_area_id = EXCLUDED.tipo_area_id,
      sede_id = EXCLUDED.sede_id,
      unidad_id = EXCLUDED.unidad_id;
  END IF;

  IF to_regclass('staging_etl.via') IS NOT NULL THEN
    INSERT INTO public.via (
      codigo, nombre, superficie, techado, accesible, verificado_en, geom,
      tipo_via_id, sede_id, grupo_id
    )
    SELECT
      upper(trim(v.codigo)),
      NULLIF(trim(v.nombre), ''),
      NULLIF(lower(trim(COALESCE(v.superficie, ''))), ''),
      upper(trim(COALESCE(v.techado::text, 'N'))) IN ('S', 'SI', 'TRUE', 'T', '1', 'Y'),
      upper(trim(COALESCE(v.accesible::text, 'S'))) IN ('S', 'SI', 'TRUE', 'T', '1', 'Y'),
      NULLIF(trim(COALESCE(v.verificado::text, '')), '')::date,
      v.geom,
      tv.id,
      s.id,
      COALESCE(NULLIF(regexp_replace(COALESCE(v.grupo::text, ''), '[^0-9]', '', 'g'), '')::smallint, 16)
    FROM staging_etl.via v
    JOIN public.tipo_via tv ON tv.codigo = upper(trim(v.tipo))
    LEFT JOIN public.sede s ON s.codigo = upper(trim(COALESCE(v.sede, '')))
    WHERE v.codigo IS NOT NULL
    ON CONFLICT (codigo) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      superficie = EXCLUDED.superficie,
      techado = EXCLUDED.techado,
      accesible = EXCLUDED.accesible,
      verificado_en = EXCLUDED.verificado_en,
      geom = EXCLUDED.geom,
      tipo_via_id = EXCLUDED.tipo_via_id,
      sede_id = EXCLUDED.sede_id;
  END IF;
END $$;

SELECT public.armar_red();
DROP SCHEMA IF EXISTS staging_etl CASCADE;
SQL

echo "ETL completado. Verificando QA topológica:"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "SELECT (SELECT count(*) FROM v_ambiente_fuera_de_edificio) AS fuera_edif, (SELECT count(*) FROM v_via_desconectada) AS via_desc, (SELECT count(*) FROM v_entrada_sin_via) AS ent_sin_via;"
