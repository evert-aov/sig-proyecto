import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { FotoResumen } from '../../domain/models/centro-interno.model';
import { ArchivoFotoSubido, FOTO_STORAGE_PORT, IFotoStoragePort } from '../../domain/ports/storage.port';
import {
  FOTOS_REPOSITORY,
  IFotosRepository,
  IUsuariosRepository,
  USUARIOS_REPOSITORY,
} from '../../domain/repositories/repositories.interface';
import { LoginDto, SubirFotoDto } from '../dto/comunes.dto';

@Injectable()
export class SubirFotoUseCase {
  constructor(
    @Inject(FOTOS_REPOSITORY) private readonly fotosRepo: IFotosRepository,
    @Inject(FOTO_STORAGE_PORT) private readonly storage: IFotoStoragePort,
  ) {}

  async ejecutar(dto: SubirFotoDto, archivo: ArchivoFotoSubido): Promise<FotoResumen> {
    const ambienteCodigo = dto.ambienteCodigo.trim().toUpperCase();
    const ruta = await this.storage.guardarFoto('CINT', ambienteCodigo, archivo);
    try {
      return await this.fotosRepo.registrarFotoAmbiente({
        ambienteCodigo,
        ruta,
        tipo: dto.tipo,
        principal: dto.principal ?? false,
        descripcion: dto.descripcion?.trim(),
        grupoId: 16,
      });
    } catch (err) {
      await this.storage.eliminarArchivo(ruta);
      throw err;
    }
  }
}

@Injectable()
export class EliminarFotoUseCase {
  constructor(
    @Inject(FOTOS_REPOSITORY) private readonly fotosRepo: IFotosRepository,
    @Inject(FOTO_STORAGE_PORT) private readonly storage: IFotoStoragePort,
  ) {}

  async ejecutar(id: number): Promise<{ eliminada: boolean; id: number }> {
    const foto = await this.fotosRepo.obtenerPorId(id);
    if (!foto) {
      throw new NotFoundException(`Foto ${id} no encontrada.`);
    }
    await this.fotosRepo.eliminar(id);
    await this.storage.eliminarArchivo(foto.ruta);
    return { eliminada: true, id };
  }
}

export interface ResultadoLogin {
  accessToken: string;
  usuario: {
    id: number;
    correo: string;
    nombre: string;
    rol: string;
    grupoId: number;
  };
}

@Injectable()
export class AutenticarUsuarioUseCase {
  constructor(
    @Inject(USUARIOS_REPOSITORY) private readonly usuariosRepo: IUsuariosRepository,
    private readonly jwtService: JwtService,
  ) {}

  async ejecutar(dto: LoginDto): Promise<ResultadoLogin> {
    const usuario = await this.usuariosRepo.buscarPorCorreo(dto.correo.trim().toLowerCase());
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
      grupoId: usuario.grupoId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
        grupoId: usuario.grupoId,
      },
    };
  }
}
