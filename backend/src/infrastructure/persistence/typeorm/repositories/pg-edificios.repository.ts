import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatosActualizarEdificio, EdificioResumenModel } from '../../../../domain/models/catalogo.model';
import { IEdificiosRepository } from '../../../../domain/repositories/repositories.interface';

@Injectable()
export class PgEdificiosRepository implements IEdificiosRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async actualizarDescriptivos(
    codigo: string,
    datos: DatosActualizarEdificio,
  ): Promise<EdificioResumenModel | null> {
    const existe: Array<{ id: number }> = await this.dataSource.query(
      `SELECT id FROM public.edificio WHERE codigo = $1 LIMIT 1`,
      [codigo],
    );
    if (existe.length === 0) {
      return null;
    }

    const actualizarDescripcion = datos.descripcion !== undefined;

    await this.dataSource.query(
      `UPDATE public.edificio
       SET nombre = COALESCE($2, nombre),
           alias = COALESCE($3, alias),
           uso = COALESCE($4, uso),
           pisos = COALESCE($5, pisos),
           ascensor = COALESCE($6, ascensor),
           descripcion = CASE WHEN $7::boolean THEN $8 ELSE descripcion END
       WHERE codigo = $1`,
      [
        codigo,
        datos.nombre ?? null,
        datos.alias ?? null,
        datos.uso ?? null,
        datos.pisos ?? null,
        datos.ascensor ?? null,
        actualizarDescripcion,
        datos.descripcion ?? null,
      ],
    );

    const rows: EdificioResumenModel[] = await this.dataSource.query(
      `SELECT
         e.id, e.codigo, e.nombre, e.alias, e.uso, e.pisos, e.ascensor, e.descripcion,
         e.area_m2::float8 AS "areaM2",
         s.codigo AS "sedeCodigo",
         ST_X(COALESCE(e.centro, ST_Centroid(e.geom)))::float8 AS lon,
         ST_Y(COALESCE(e.centro, ST_Centroid(e.geom)))::float8 AS lat
       FROM public.edificio e
       JOIN public.sede s ON s.id = e.sede_id
       WHERE e.codigo = $1
       LIMIT 1`,
      [codigo],
    );

    return rows[0] ?? null;
  }
}
