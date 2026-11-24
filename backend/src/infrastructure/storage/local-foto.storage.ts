import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ArchivoFotoSubido, IFotoStoragePort } from '../../domain/ports/storage.port';
import { loadEnvConfig } from '../config/env.config';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Injectable()
export class LocalFotoStorage implements IFotoStoragePort {
  private readonly baseDir: string;

  constructor() {
    const env = loadEnvConfig();
    this.baseDir = path.resolve(process.cwd(), env.uploadDir);
  }

  async guardarFoto(
    grupoCodigo: string,
    elementoCodigo: string,
    archivo: ArchivoFotoSubido,
  ): Promise<string> {
    const ext = MIME_TO_EXT[archivo.mimeType];
    if (!ext) {
      throw new BadRequestException('Formato de imagen no soportado. Use JPG, PNG o WebP.');
    }

    const grupoSeguro = this.sanitizarCodigo(grupoCodigo);
    const codigoSeguro = this.sanitizarCodigo(elementoCodigo);
    const nombreBase = path
      .basename(archivo.originalName, path.extname(archivo.originalName))
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .slice(0, 40) || 'foto';

    const archivoFinal = `${Date.now()}-${nombreBase}${ext}`;
    const rutaRelativa = `${grupoSeguro}/${codigoSeguro}/${archivoFinal}`;
    const destinoAbsoluto = path.resolve(this.baseDir, rutaRelativa);

    if (!destinoAbsoluto.startsWith(this.baseDir + path.sep)) {
      throw new BadRequestException('Ruta de almacenamiento inválida.');
    }

    await fs.mkdir(path.dirname(destinoAbsoluto), { recursive: true });
    await fs.writeFile(destinoAbsoluto, archivo.buffer);
    return rutaRelativa;
  }

  async eliminarArchivo(rutaRelativa: string): Promise<void> {
    const destinoAbsoluto = path.resolve(this.baseDir, rutaRelativa);
    if (!destinoAbsoluto.startsWith(this.baseDir + path.sep)) {
      return;
    }
    try {
      await fs.unlink(destinoAbsoluto);
    } catch {
      // Ignorar si ya fue eliminado del disco
    }
  }

  private sanitizarCodigo(valor: string): string {
    const limpio = valor.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!limpio) {
      throw new BadRequestException('Código inválido para almacenar foto.');
    }
    return limpio;
  }
}
