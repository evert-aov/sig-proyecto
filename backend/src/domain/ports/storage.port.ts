export const FOTO_STORAGE_PORT = Symbol('FOTO_STORAGE_PORT');

export interface ArchivoFotoSubido {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export interface IFotoStoragePort {
  guardarFoto(grupoCodigo: string, elementoCodigo: string, archivo: ArchivoFotoSubido): Promise<string>;
  eliminarArchivo(rutaRelativa: string): Promise<void>;
}
