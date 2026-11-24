import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CentroInternoModel,
  DatosActualizarCentroInterno,
  DatosCrearCentroInterno,
  FiltroCentrosInternos,
} from '../../domain/models/centro-interno.model';
import {
  CENTROS_INTERNOS_REPOSITORY,
  ICentrosInternosRepository,
} from '../../domain/repositories/repositories.interface';
import { ActualizarCentroInternoDto } from '../dto/actualizar-centro-interno.dto';
import { CrearCentroInternoDto } from '../dto/crear-centro-interno.dto';

@Injectable()
export class ListarCentrosInternosUseCase {
  constructor(
    @Inject(CENTROS_INTERNOS_REPOSITORY)
    private readonly repo: ICentrosInternosRepository,
  ) {}

  ejecutar(filtro: FiltroCentrosInternos): Promise<CentroInternoModel[]> {
    return this.repo.listar(filtro);
  }
}

@Injectable()
export class ObtenerCentroInternoUseCase {
  constructor(
    @Inject(CENTROS_INTERNOS_REPOSITORY)
    private readonly repo: ICentrosInternosRepository,
  ) {}

  async ejecutar(codigo: string): Promise<CentroInternoModel> {
    const centro = await this.repo.obtenerPorCodigo(codigo.toUpperCase());
    if (!centro) {
      throw new NotFoundException(`Centro Interno '${codigo}' no encontrado.`);
    }
    return centro;
  }
}

@Injectable()
export class CrearCentroInternoUseCase {
  constructor(
    @Inject(CENTROS_INTERNOS_REPOSITORY)
    private readonly repo: ICentrosInternosRepository,
  ) {}

  ejecutar(dto: CrearCentroInternoDto): Promise<CentroInternoModel> {
    const datos: DatosCrearCentroInterno = {
      codigo: dto.codigo.trim().toUpperCase(),
      nombre: dto.nombre.trim(),
      alias: dto.alias ?? [],
      piso: dto.piso,
      referencia: dto.referencia?.trim(),
      encargado: dto.encargado?.trim(),
      telefono: dto.telefono?.trim(),
      horario: dto.horario?.trim(),
      servicios: dto.servicios ?? [],
      descripcion: dto.descripcion?.trim(),
      unidadCodigo: dto.unidadCodigo?.trim().toUpperCase(),
      edificioCodigo: dto.edificioCodigo?.trim().toUpperCase(),
      sedeCodigo: dto.sedeCodigo?.trim().toUpperCase(),
      lon: dto.lon,
      lat: dto.lat,
      grupoId: 16,
    };
    return this.repo.crear(datos);
  }
}

@Injectable()
export class ActualizarCentroInternoUseCase {
  constructor(
    @Inject(CENTROS_INTERNOS_REPOSITORY)
    private readonly repo: ICentrosInternosRepository,
  ) {}

  async ejecutar(codigo: string, dto: ActualizarCentroInternoDto): Promise<CentroInternoModel> {
    const datos: DatosActualizarCentroInterno = {
      nombre: dto.nombre?.trim(),
      alias: dto.alias,
      piso: dto.piso,
      referencia: dto.referencia?.trim(),
      encargado: dto.encargado?.trim(),
      telefono: dto.telefono?.trim(),
      horario: dto.horario?.trim(),
      servicios: dto.servicios,
      descripcion: dto.descripcion?.trim(),
      unidadCodigo: dto.unidadCodigo?.trim().toUpperCase(),
      edificioCodigo: dto.edificioCodigo?.trim().toUpperCase(),
      lon: dto.lon,
      lat: dto.lat,
    };
    const actualizado = await this.repo.actualizar(codigo.toUpperCase(), datos);
    if (!actualizado) {
      throw new NotFoundException(`Centro Interno '${codigo}' no encontrado.`);
    }
    return actualizado;
  }
}

@Injectable()
export class EliminarCentroInternoUseCase {
  constructor(
    @Inject(CENTROS_INTERNOS_REPOSITORY)
    private readonly repo: ICentrosInternosRepository,
  ) {}

  async ejecutar(codigo: string): Promise<{ eliminado: boolean; codigo: string }> {
    const ok = await this.repo.eliminar(codigo.toUpperCase());
    if (!ok) {
      throw new NotFoundException(`Centro Interno '${codigo}' no encontrado.`);
    }
    return { eliminado: true, codigo: codigo.toUpperCase() };
  }
}
