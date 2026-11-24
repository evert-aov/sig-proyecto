import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FotoResumen } from '../../../../domain/models/centro-interno.model';
import { UsuarioAppModel } from '../../../../domain/models/espacial-y-seguridad.model';
import {
  DatosRegistrarFoto,
  IFotosRepository,
  IUsuariosRepository,
} from '../../../../domain/repositories/repositories.interface';

@Injectable()
export class PgFotosRepository implements IFotosRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async registrarFotoAmbiente(datos: DatosRegistrarFoto): Promise<FotoResumen> {
    const ambRows: Array<{ id: number }> = await this.dataSource.query(
      `SELECT id FROM public.ambiente WHERE codigo = $1 LIMIT 1`,
      [datos.ambienteCodigo],
    );
    if (ambRows.length === 0) {
      throw new BadRequestException(`El ambiente '${datos.ambienteCodigo}' no existe.`);
    }
    const ambienteId = ambRows[0].id;

    if (datos.principal) {
      await this.dataSource.query(
        `UPDATE public.foto SET principal = false WHERE ambiente_id = $1 AND principal = true`,
        [ambienteId],
      );
    }

    const inserted: FotoResumen[] = await this.dataSource.query(
      `INSERT INTO public.foto (ruta, tipo, principal, descripcion, tomada_en, ambiente_id, grupo_id)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6)
       RETURNING id, ruta, tipo, principal, descripcion, tomada_en::text AS "tomadaEn"`,
      [datos.ruta, datos.tipo, datos.principal, datos.descripcion ?? null, ambienteId, datos.grupoId],
    );
    return inserted[0];
  }

  async obtenerPorId(id: number): Promise<FotoResumen | null> {
    const rows: FotoResumen[] = await this.dataSource.query(
      `SELECT id, ruta, tipo, principal, descripcion, tomada_en::text AS "tomadaEn"
       FROM public.foto WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await this.dataSource.query(`DELETE FROM public.foto WHERE id = $1 RETURNING id`, [id]);
    return res.length > 0;
  }
}

@Injectable()
export class PgUsuariosRepository implements IUsuariosRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async buscarPorCorreo(correo: string): Promise<UsuarioAppModel | null> {
    const rows: UsuarioAppModel[] = await this.dataSource.query(
      `SELECT id, correo, nombre, password_hash AS "passwordHash", rol, grupo_id AS "grupoId", activo
       FROM app_auth.usuario_app WHERE lower(correo) = lower($1) LIMIT 1`,
      [correo],
    );
    return rows[0] ?? null;
  }

  async buscarPorId(id: number): Promise<UsuarioAppModel | null> {
    const rows: UsuarioAppModel[] = await this.dataSource.query(
      `SELECT id, correo, nombre, password_hash AS "passwordHash", rol, grupo_id AS "grupoId", activo
       FROM app_auth.usuario_app WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }
}
