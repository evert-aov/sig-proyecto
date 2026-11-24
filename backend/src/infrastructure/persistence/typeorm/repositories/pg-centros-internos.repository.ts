import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CentroInternoModel,
  DatosActualizarCentroInterno,
  DatosCrearCentroInterno,
  FiltroCentrosInternos,
  FotoResumen,
} from '../../../../domain/models/centro-interno.model';
import { ICentrosInternosRepository } from '../../../../domain/repositories/repositories.interface';

interface AmbienteViewRow {
  id: number;
  codigo: string;
  nombre: string;
  alias: string[];
  piso: number;
  referencia: string | null;
  encargado: string | null;
  telefono: string | null;
  horario: string | null;
  servicios: string[];
  descripcion: string | null;
  verificado_en: string | null;
  grupo_id: number;
  tipo_codigo: string;
  tipo_nombre: string;
  categoria: string;
  color: string;
  icono: string;
  unidad_id: number | null;
  unidad_codigo: string | null;
  unidad_nombre: string | null;
  unidad_sigla: string | null;
  unidad_responsable: string | null;
  unidad_correo: string | null;
  facultad_id: number | null;
  facultad_codigo: string | null;
  facultad_nombre: string | null;
  facultad_sigla: string | null;
  edificio_id: number | null;
  edificio_codigo: string | null;
  edificio_nombre: string | null;
  edificio_pisos: number | null;
  edificio_ascensor: boolean;
  sede_id: number | null;
  sede_codigo: string | null;
  sede_nombre: string | null;
  llegada_sin_escaleras: boolean;
  foto_principal: string | null;
  lon: number;
  lat: number;
}

@Injectable()
export class PgCentrosInternosRepository implements ICentrosInternosRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async listar(filtro: FiltroCentrosInternos): Promise<CentroInternoModel[]> {
    const rows: AmbienteViewRow[] = await this.dataSource.query(
      `SELECT va.*
       FROM public.v_ambiente va
       WHERE va.tipo_codigo = 'CENTRO_INTERNO'
         AND ($1::int IS NULL OR va.facultad_id = $1)
         AND ($2::text IS NULL OR va.sede_codigo = upper($2))
         AND ($3::boolean IS NULL OR $3 = false OR va.llegada_sin_escaleras = true)
         AND ($4::text IS NULL OR (
           unaccent(lower(va.nombre)) LIKE '%' || unaccent(lower($4)) || '%'
           OR unaccent(lower(va.codigo)) LIKE '%' || unaccent(lower($4)) || '%'
           OR unaccent(lower(COALESCE(va.unidad_sigla, ''))) LIKE '%' || unaccent(lower($4)) || '%'
           OR unaccent(lower(COALESCE(va.facultad_nombre, ''))) LIKE '%' || unaccent(lower($4)) || '%'
         ))
       ORDER BY va.facultad_sigla NULLS LAST, va.nombre`,
      [
        filtro.facultadId ?? null,
        filtro.sedeCodigo ?? null,
        filtro.soloSinEscaleras ?? null,
        filtro.texto?.trim() || null,
      ],
    );

    return rows.map((row) => this.mapRow(row, []));
  }

  async obtenerPorCodigo(codigo: string): Promise<CentroInternoModel | null> {
    const rows: AmbienteViewRow[] = await this.dataSource.query(
      `SELECT va.*
       FROM public.v_ambiente va
       WHERE va.codigo = $1 AND va.tipo_codigo = 'CENTRO_INTERNO'
       LIMIT 1`,
      [codigo],
    );
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    const fotos: FotoResumen[] = await this.dataSource.query(
      `SELECT id, ruta, tipo, principal, descripcion, tomada_en::text AS "tomadaEn"
       FROM public.foto
       WHERE ambiente_id = $1
       ORDER BY principal DESC, id ASC`,
      [row.id],
    );
    return this.mapRow(row, fotos);
  }

  async crear(datos: DatosCrearCentroInterno): Promise<CentroInternoModel> {
    const unidadId = await this.resolverUnidadId(datos.unidadCodigo);
    const edificioId = await this.resolverEdificioId(datos.edificioCodigo);
    const sedeId = await this.resolverSedeId(datos.sedeCodigo);

    await this.dataSource.query(
      `INSERT INTO public.ambiente (
        codigo, nombre, alias, piso, referencia, encargado, telefono, horario,
        servicios, descripcion, verificado_en, geom, tipo_ambiente_id,
        unidad_id, edificio_id, sede_id, grupo_id
      )
      SELECT
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, CURRENT_DATE, ST_SetSRID(ST_MakePoint($11, $12), 4326), ta.id,
        $13, $14, $15, $16
      FROM public.tipo_ambiente ta
      WHERE ta.codigo = 'CENTRO_INTERNO'`,
      [
        datos.codigo,
        datos.nombre,
        datos.alias,
        datos.piso,
        datos.referencia ?? null,
        datos.encargado ?? null,
        datos.telefono ?? null,
        datos.horario ?? null,
        datos.servicios,
        datos.descripcion ?? null,
        datos.lon,
        datos.lat,
        unidadId,
        edificioId,
        sedeId,
        datos.grupoId,
      ],
    );

    const creado = await this.obtenerPorCodigo(datos.codigo);
    if (!creado) {
      throw new BadRequestException('No se pudo recuperar el Centro Interno creado.');
    }
    return creado;
  }

  async actualizar(codigo: string, datos: DatosActualizarCentroInterno): Promise<CentroInternoModel | null> {
    const existente = await this.obtenerPorCodigo(codigo);
    if (!existente) {
      return null;
    }

    const unidadId =
      datos.unidadCodigo !== undefined ? await this.resolverUnidadId(datos.unidadCodigo) : existente.unidadId;
    const edificioId =
      datos.edificioCodigo !== undefined ? await this.resolverEdificioId(datos.edificioCodigo) : existente.edificioId;

    const lon = datos.lon ?? existente.lon;
    const lat = datos.lat ?? existente.lat;

    await this.dataSource.query(
      `UPDATE public.ambiente
       SET nombre = COALESCE($2, nombre),
           alias = COALESCE($3, alias),
           piso = COALESCE($4, piso),
           referencia = COALESCE($5, referencia),
           encargado = COALESCE($6, encargado),
           telefono = COALESCE($7, telefono),
           horario = COALESCE($8, horario),
           servicios = COALESCE($9, servicios),
           descripcion = COALESCE($10, descripcion),
           unidad_id = $11,
           edificio_id = $12,
           geom = ST_SetSRID(ST_MakePoint($13, $14), 4326)
       WHERE id = $1`,
      [
        existente.id,
        datos.nombre ?? null,
        datos.alias ?? null,
        datos.piso ?? null,
        datos.referencia ?? null,
        datos.encargado ?? null,
        datos.telefono ?? null,
        datos.horario ?? null,
        datos.servicios ?? null,
        datos.descripcion ?? null,
        unidadId,
        edificioId,
        lon,
        lat,
      ],
    );

    return this.obtenerPorCodigo(codigo);
  }

  async eliminar(codigo: string): Promise<boolean> {
    const res = await this.dataSource.query(
      `DELETE FROM public.ambiente a
       USING public.tipo_ambiente ta
       WHERE a.tipo_ambiente_id = ta.id
         AND ta.codigo = 'CENTRO_INTERNO'
         AND a.codigo = $1
       RETURNING a.id`,
      [codigo],
    );
    return res.length > 0;
  }

  private async resolverUnidadId(codigo?: string): Promise<number | null> {
    if (!codigo) return null;
    const rows: Array<{ id: number }> = await this.dataSource.query(
      `SELECT id FROM public.unidad WHERE codigo = $1 LIMIT 1`,
      [codigo],
    );
    if (rows.length === 0) {
      throw new BadRequestException(`La unidad '${codigo}' no existe.`);
    }
    return rows[0].id;
  }

  private async resolverEdificioId(codigo?: string): Promise<number | null> {
    if (!codigo) return null;
    const rows: Array<{ id: number }> = await this.dataSource.query(
      `SELECT id FROM public.edificio WHERE codigo = $1 LIMIT 1`,
      [codigo],
    );
    if (rows.length === 0) {
      throw new BadRequestException(`El edificio '${codigo}' no existe.`);
    }
    return rows[0].id;
  }

  private async resolverSedeId(codigo?: string): Promise<number | null> {
    if (!codigo) return null;
    const rows: Array<{ id: number }> = await this.dataSource.query(
      `SELECT id FROM public.sede WHERE codigo = $1 LIMIT 1`,
      [codigo],
    );
    if (rows.length === 0) {
      throw new BadRequestException(`La sede '${codigo}' no existe.`);
    }
    return rows[0].id;
  }

  private mapRow(row: AmbienteViewRow, fotos: FotoResumen[]): CentroInternoModel {
    return {
      id: row.id,
      codigo: row.codigo,
      nombre: row.nombre,
      alias: row.alias ?? [],
      piso: row.piso,
      referencia: row.referencia,
      encargado: row.encargado,
      telefono: row.telefono,
      horario: row.horario,
      servicios: row.servicios ?? [],
      descripcion: row.descripcion,
      verificadoEn: row.verificado_en,
      grupoId: row.grupo_id,
      tipoCodigo: row.tipo_codigo,
      tipoNombre: row.tipo_nombre,
      categoria: row.categoria,
      color: row.color,
      icono: row.icono,
      unidadId: row.unidad_id,
      unidadCodigo: row.unidad_codigo,
      unidadNombre: row.unidad_nombre,
      unidadSigla: row.unidad_sigla,
      unidadResponsable: row.unidad_responsable,
      unidadCorreo: row.unidad_correo,
      facultadId: row.facultad_id,
      facultadCodigo: row.facultad_codigo,
      facultadNombre: row.facultad_nombre,
      facultadSigla: row.facultad_sigla,
      edificioId: row.edificio_id,
      edificioCodigo: row.edificio_codigo,
      edificioNombre: row.edificio_nombre,
      edificioPisos: row.edificio_pisos,
      edificioAscensor: row.edificio_ascensor,
      sedeId: row.sede_id,
      sedeCodigo: row.sede_codigo,
      sedeNombre: row.sede_nombre,
      llegadaSinEscaleras: row.llegada_sin_escaleras,
      fotoPrincipal: row.foto_principal,
      fotos,
      lon: Number(row.lon),
      lat: Number(row.lat),
    };
  }
}
