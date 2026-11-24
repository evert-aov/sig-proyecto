import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  FiltroCapas,
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonGeometry,
  NombreCapa,
} from '../../../../domain/models/geojson.model';
import { ICapasRepository } from '../../../../domain/repositories/repositories.interface';

interface GeoRow {
  id: number;
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
}

@Injectable()
export class PgCapasRepository implements ICapasRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async obtenerGeoJson(capa: NombreCapa, filtro: FiltroCapas): Promise<GeoJsonFeatureCollection> {
    let rows: GeoRow[] = [];

    switch (capa) {
      case 'sedes':
        rows = await this.dataSource.query(
          `SELECT s.id, ST_AsGeoJSON(s.geom)::jsonb AS geometry,
            jsonb_build_object(
              'id', s.id, 'codigo', s.codigo, 'nombre', s.nombre,
              'tipo', s.tipo, 'municipio', s.municipio, 'direccion', s.direccion,
              'area_m2', s.area_m2::float8
            ) AS properties
          FROM public.sede s
          WHERE s.geom IS NOT NULL
            AND ($1::text IS NULL OR s.codigo = upper($1))
          ORDER BY s.codigo`,
          [filtro.sedeCodigo ?? null],
        );
        break;

      case 'edificios':
        rows = await this.dataSource.query(
          `SELECT e.id, ST_AsGeoJSON(e.geom)::jsonb AS geometry,
            jsonb_build_object(
              'id', e.id, 'codigo', e.codigo, 'nombre', e.nombre, 'alias', e.alias,
              'uso', e.uso, 'pisos', e.pisos, 'altura_m', (e.pisos * 3.5),
              'ascensor', e.ascensor, 'descripcion', e.descripcion,
              'area_m2', e.area_m2::float8, 'sede_codigo', s.codigo, 'sede_nombre', s.nombre,
              'tiene_centro_interno', EXISTS(
                SELECT 1 FROM public.v_ambiente va
                WHERE va.edificio_id = e.id AND va.tipo_codigo = 'CENTRO_INTERNO'
                  AND ($2::int IS NULL OR va.facultad_id = $2)
              ),
              'total_centros_internos', (
                SELECT COUNT(*)::int FROM public.v_ambiente va
                WHERE va.edificio_id = e.id AND va.tipo_codigo = 'CENTRO_INTERNO'
                  AND ($2::int IS NULL OR va.facultad_id = $2)
              )
            ) AS properties
          FROM public.edificio e
          JOIN public.sede s ON s.id = e.sede_id
          WHERE e.geom IS NOT NULL
            AND ($1::text IS NULL OR s.codigo = upper($1))
          ORDER BY e.codigo`,
          [filtro.sedeCodigo ?? null, filtro.facultadId ?? null],
        );
        break;

      case 'ambientes':
      case 'centros-internos':
        rows = await this.dataSource.query(
          `SELECT va.id, ST_AsGeoJSON(va.geom)::jsonb AS geometry,
            jsonb_build_object(
              'id', va.id, 'codigo', va.codigo, 'nombre', va.nombre, 'alias', va.alias,
              'piso', va.piso, 'referencia', va.referencia, 'encargado', va.encargado,
              'telefono', va.telefono, 'horario', va.horario, 'servicios', va.servicios,
              'descripcion', va.descripcion, 'tipo_codigo', va.tipo_codigo,
              'tipo_nombre', va.tipo_nombre, 'categoria', va.categoria,
              'color', va.color, 'icono', va.icono,
              'unidad_codigo', va.unidad_codigo, 'unidad_sigla', va.unidad_sigla,
              'facultad_id', va.facultad_id, 'facultad_codigo', va.facultad_codigo,
              'facultad_nombre', va.facultad_nombre, 'facultad_sigla', va.facultad_sigla,
              'edificio_codigo', va.edificio_codigo, 'edificio_nombre', va.edificio_nombre,
              'edificio_pisos', va.edificio_pisos, 'edificio_ascensor', va.edificio_ascensor,
              'sede_codigo', va.sede_codigo, 'sede_nombre', va.sede_nombre,
              'llegada_sin_escaleras', va.llegada_sin_escaleras,
              'foto_principal', va.foto_principal
            ) AS properties
          FROM public.v_ambiente va
          WHERE ($1::boolean = false OR va.tipo_codigo = 'CENTRO_INTERNO')
            AND ($2::int IS NULL OR va.facultad_id = $2)
            AND ($3::text IS NULL OR va.sede_codigo = upper($3))
            AND ($4::text IS NULL OR va.categoria = $4)
            AND ($5::boolean IS NULL OR $5 = false OR va.llegada_sin_escaleras = true)
          ORDER BY va.codigo`,
          [
            capa === 'centros-internos',
            filtro.facultadId ?? null,
            filtro.sedeCodigo ?? null,
            filtro.categoria ?? null,
            filtro.soloAccesible ?? null,
          ],
        );
        break;

      case 'puntos-interes':
        rows = await this.dataSource.query(
          `SELECT vp.id, ST_AsGeoJSON(vp.geom)::jsonb AS geometry,
            jsonb_build_object(
              'id', vp.id, 'codigo', vp.codigo, 'nombre', vp.nombre, 'piso', vp.piso,
              'accesible', vp.accesible, 'llegada_sin_escaleras', vp.llegada_sin_escaleras,
              'nota', vp.nota, 'tipo_codigo', vp.tipo_codigo, 'tipo_nombre', vp.tipo_nombre,
              'categoria', vp.categoria, 'color', vp.color, 'icono', vp.icono,
              'extintor_agente', vp.extintor_agente, 'extintor_kg', vp.extintor_kg::float8,
              'extintor_vence', vp.extintor_vence, 'extintor_vencido', vp.extintor_vencido,
              'edificio_codigo', vp.edificio_codigo, 'sede_codigo', vp.sede_codigo
            ) AS properties
          FROM public.v_punto_interes vp
          WHERE ($1::text IS NULL OR vp.sede_codigo = upper($1))
            AND ($2::text IS NULL OR vp.categoria = $2)
            AND ($3::boolean IS NULL OR $3 = false OR vp.accesible = true)
          ORDER BY vp.codigo`,
          [filtro.sedeCodigo ?? null, filtro.categoria ?? null, filtro.soloAccesible ?? null],
        );
        break;

      case 'areas':
        rows = await this.dataSource.query(
          `SELECT ar.id, ST_AsGeoJSON(ar.geom)::jsonb AS geometry,
            jsonb_build_object(
              'id', ar.id, 'codigo', ar.codigo, 'nombre', COALESCE(ar.nombre, ta.nombre),
              'tipo_codigo', ta.codigo, 'tipo_nombre', ta.nombre,
              'categoria', ta.categoria, 'color', ta.color, 'icono', ta.icono,
              'material', ar.material, 'capacidad', ar.capacidad, 'acceso', ar.acceso,
              'nota', ar.nota, 'area_m2', ar.area_m2::float8, 'sede_codigo', s.codigo
            ) AS properties
          FROM public.area ar
          JOIN public.tipo_area ta ON ta.id = ar.tipo_area_id
          LEFT JOIN public.sede s ON s.id = ar.sede_id
          WHERE ($1::text IS NULL OR s.codigo = upper($1))
            AND ($2::text IS NULL OR ta.categoria = $2)
          ORDER BY ar.codigo`,
          [filtro.sedeCodigo ?? null, filtro.categoria ?? null],
        );
        break;

      case 'vias':
        rows = await this.dataSource.query(
          `SELECT v.id, ST_AsGeoJSON(v.geom)::jsonb AS geometry,
            jsonb_build_object(
              'id', v.id, 'codigo', v.codigo, 'nombre', COALESCE(v.nombre, v.codigo),
              'tipo_codigo', tv.codigo, 'tipo_nombre', tv.nombre,
              'categoria', tv.categoria, 'color', tv.color,
              'superficie', v.superficie, 'techado', v.techado,
              'accesible', v.accesible, 'longitud_m', v.longitud_m::float8,
              'sede_codigo', s.codigo
            ) AS properties
          FROM public.via v
          JOIN public.tipo_via tv ON tv.id = v.tipo_via_id
          LEFT JOIN public.sede s ON s.id = v.sede_id
          WHERE ($1::text IS NULL OR s.codigo = upper($1))
            AND ($2::boolean IS NULL OR $2 = false OR v.accesible = true)
          ORDER BY v.codigo`,
          [filtro.sedeCodigo ?? null, filtro.soloAccesible ?? null],
        );
        break;
    }

    const features: GeoJsonFeature[] = rows.map((row) => ({
      type: 'Feature',
      id: row.id,
      geometry: row.geometry,
      properties: row.properties,
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }
}
