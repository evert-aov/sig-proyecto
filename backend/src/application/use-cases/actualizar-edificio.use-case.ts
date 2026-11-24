import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatosActualizarEdificio, EdificioResumenModel } from '../../domain/models/catalogo.model';
import {
  EDIFICIOS_REPOSITORY,
  IEdificiosRepository,
} from '../../domain/repositories/repositories.interface';
import { ActualizarEdificioDto } from '../dto/actualizar-edificio.dto';

@Injectable()
export class ActualizarEdificioUseCase {
  constructor(
    @Inject(EDIFICIOS_REPOSITORY)
    private readonly edificiosRepo: IEdificiosRepository,
  ) {}

  async ejecutar(codigo: string, dto: ActualizarEdificioDto): Promise<EdificioResumenModel> {
    const datos: DatosActualizarEdificio = {
      nombre: dto.nombre?.trim(),
      alias: dto.alias?.map((a) => a.trim()).filter(Boolean),
      uso: dto.uso,
      pisos: dto.pisos,
      ascensor: dto.ascensor,
      descripcion:
        dto.descripcion === undefined
          ? undefined
          : dto.descripcion === null
            ? null
            : dto.descripcion.trim() || null,
    };

    const actualizado = await this.edificiosRepo.actualizarDescriptivos(codigo.trim().toUpperCase(), datos);
    if (!actualizado) {
      throw new NotFoundException(`Edificio '${codigo}' no encontrado.`);
    }
    return actualizado;
  }
}
