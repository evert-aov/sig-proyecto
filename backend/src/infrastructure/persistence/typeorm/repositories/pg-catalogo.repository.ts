import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EdificioResumenModel,
  FacultadModel,
  LeyendaItemModel,
  SedeModel,
  UnidadCentroModel,
} from '../../../../domain/models/catalogo.model';
import { ICatalogoRepository } from '../../../../domain/repositories/repositories.interface';

@Injectable()
export class PgCatalogoRepository implements ICatalogoRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  obtenerLeyenda(): Promise<LeyendaItemModel[]> {
    return this.dataSource.query(
      `SELECT capa, codigo, nombre, categoria, color, icono, orden, descripcion
       FROM public.v_leyenda`,
    );
  }

  obtenerFacultades(): Promise<FacultadModel[]> {
    return this.dataSource.query(
      `SELECT
         u.id,
         u.codigo,
         u.nombre,
         u.sigla,
         u.alias,
         COUNT(va.id)::int AS "totalCentrosInternos"
       FROM public.unidad u
       LEFT JOIN public.v_ambiente va
         ON va.facultad_id = u.id AND va.tipo_codigo = 'CENTRO_INTERNO'
       WHERE u.tipo = 'facultad'
       GROUP BY u.id, u.codigo, u.nombre, u.sigla, u.alias
       ORDER BY "totalCentrosInternos" DESC, u.nombre ASC`,
    );
  }

  obtenerSedes(): Promise<SedeModel[]> {
    return this.dataSource.query(
      `SELECT id, codigo, nombre, tipo, municipio, direccion, area_m2::float8 AS "areaM2"
       FROM public.sede
       ORDER BY id ASC`,
    );
  }

  obtenerEdificios(): Promise<EdificioResumenModel[]> {
    return this.dataSource.query(
      `SELECT
         e.id, e.codigo, e.nombre, e.uso, e.pisos, e.ascensor,
         e.area_m2::float8 AS "areaM2",
         s.codigo AS "sedeCodigo",
         ST_X(COALESCE(e.centro, ST_Centroid(e.geom)))::float8 AS lon,
         ST_Y(COALESCE(e.centro, ST_Centroid(e.geom)))::float8 AS lat
       FROM public.edificio e
       JOIN public.sede s ON s.id = e.sede_id
       ORDER BY s.codigo, e.codigo`,
    );
  }

  obtenerUnidadesCentro(): Promise<UnidadCentroModel[]> {
    return this.dataSource.query(
      `WITH RECURSIVE uf AS (
         SELECT id, codigo AS fcod, nombre AS fnom, padre_id
         FROM public.unidad WHERE tipo = 'facultad'
         UNION ALL
         SELECT h.id, uf.fcod, uf.fnom, h.padre_id
         FROM public.unidad h JOIN uf ON h.padre_id = uf.id
       )
       SELECT
         u.id, u.codigo, u.nombre, u.sigla,
         uf.fcod AS "facultadCodigo",
         uf.fnom AS "facultadNombre"
       FROM public.unidad u
       LEFT JOIN uf ON uf.id = u.id
       WHERE u.tipo = 'centro'
       ORDER BY u.nombre`,
    );
  }
}
