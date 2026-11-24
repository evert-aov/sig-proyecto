import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GeoJsonFeatureCollection } from '../../../../domain/models/geojson.model';
import {
  BusquedaResultadoModel,
  QaTopologicaModel,
  ResumenSuperficieSedeModel,
  RutaCalculadaModel,
} from '../../../../domain/models/espacial-y-seguridad.model';
import {
  IBusquedaRepository,
  IEspacialRepository,
  IRutasRepository,
} from '../../../../domain/repositories/repositories.interface';

@Injectable()
export class PgBusquedaRepository implements IBusquedaRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async buscar(texto: string): Promise<BusquedaResultadoModel[]> {
    const rows = await this.dataSource.query(
      `SELECT entidad, id, codigo, nombre, subtitulo, categoria, color,
              sede_codigo AS "sedeCodigo", facultad_nombre AS "facultadNombre",
              lon::float8, lat::float8, relevancia
       FROM public.buscar($1)`,
      [texto],
    );
    return rows;
  }
}

@Injectable()
export class PgRutasRepository implements IRutasRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async calcularRuta(
    oLon: number,
    oLat: number,
    dLon: number,
    dLat: number,
    soloAccesible: boolean,
    radioM: number,
  ): Promise<RutaCalculadaModel> {
    const rows: Array<{ ruta: RutaCalculadaModel }> = await this.dataSource.query(
      `SELECT public.ruta($1, $2, $3, $4, $5, $6) AS ruta`,
      [oLon, oLat, dLon, dLat, soloAccesible, radioM],
    );
    return rows[0]?.ruta ?? { encontrada: false, mensaje: 'No se pudo calcular la ruta.' };
  }
}

@Injectable()
export class PgEspacialRepository implements IEspacialRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  obtenerResumenSuperficies(): Promise<ResumenSuperficieSedeModel[]> {
    return this.dataSource.query(
      `SELECT
         s.codigo AS "sedeCodigo",
         s.nombre AS "sedeNombre",
         COALESCE(s.area_m2, 0)::float8 AS "superficieSedeM2",
         (SELECT COUNT(*)::int FROM public.edificio e WHERE e.sede_id = s.id) AS "totalEdificios",
         COALESCE((SELECT SUM(e.area_m2) FROM public.edificio e WHERE e.sede_id = s.id), 0)::float8 AS "superficieEdificiosM2",
         (SELECT COUNT(*)::int FROM public.area ar WHERE ar.sede_id = s.id) AS "totalAreas",
         COALESCE((SELECT SUM(ar.area_m2) FROM public.area ar WHERE ar.sede_id = s.id), 0)::float8 AS "superficieAreasM2",
         COALESCE((SELECT SUM(v.longitud_m) FROM public.via v WHERE v.sede_id = s.id), 0)::float8 AS "longitudViasM",
         (SELECT COUNT(*)::int FROM public.v_ambiente va WHERE va.sede_id = s.id AND va.tipo_codigo = 'CENTRO_INTERNO') AS "totalCentrosInternos"
       FROM public.sede s
       ORDER BY s.id`,
    );
  }

  async obtenerQaTopologica(): Promise<QaTopologicaModel> {
    const [ambientesFueraDeEdificio, viasDesconectadas, entradasSinVia] = await Promise.all([
      this.dataSource.query(
        `SELECT id, codigo, nombre, edificio_codigo AS "edificioCodigo", distancia_m::float8 AS "distanciaM"
         FROM public.v_ambiente_fuera_de_edificio`,
      ),
      this.dataSource.query(
        `SELECT id, codigo, nombre FROM public.v_via_desconectada`,
      ),
      this.dataSource.query(
        `SELECT id, codigo, nombre, distancia_via_m::float8 AS "distanciaViaM"
         FROM public.v_entrada_sin_via`,
      ),
    ]);

    return {
      ambientesFueraDeEdificio,
      viasDesconectadas,
      entradasSinVia,
    };
  }

  async obtenerAmbientesEnSede(sedeCodigo: string): Promise<GeoJsonFeatureCollection> {
    const rows: Array<{ id: number; geometry: unknown; properties: Record<string, unknown> }> =
      await this.dataSource.query(
        `SELECT va.id, ST_AsGeoJSON(va.geom)::jsonb AS geometry,
          jsonb_build_object(
            'id', va.id, 'codigo', va.codigo, 'nombre', va.nombre,
            'tipo_codigo', va.tipo_codigo, 'color', va.color,
            'facultad_nombre', va.facultad_nombre, 'edificio_codigo', va.edificio_codigo,
            'sede_codigo', s.codigo
          ) AS properties
         FROM public.v_ambiente va
         JOIN public.sede s ON s.codigo = upper($1)
         WHERE s.geom IS NOT NULL AND ST_Contains(s.geom, va.geom)`,
        [sedeCodigo],
      );

    return {
      type: 'FeatureCollection',
      features: rows.map((r) => ({
        type: 'Feature',
        id: r.id,
        geometry: r.geometry as GeoJsonFeatureCollection['features'][number]['geometry'],
        properties: r.properties,
      })),
    };
  }
}
