export interface LeyendaItemModel {
  capa: string;
  codigo: string;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
  orden: number;
  descripcion: string | null;
}

export interface FacultadModel {
  id: number;
  codigo: string;
  nombre: string;
  sigla: string | null;
  alias: string[];
  totalCentrosInternos: number;
}

export interface SedeModel {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  municipio: string;
  direccion: string | null;
  areaM2: number | null;
}

export type UsoEdificio = 'academico' | 'administrativo' | 'servicios' | 'deportivo' | 'mixto';

export interface EdificioResumenModel {
  id: number;
  codigo: string;
  nombre: string;
  alias: string[];
  uso: string;
  pisos: number;
  ascensor: boolean;
  descripcion: string | null;
  areaM2: number | null;
  sedeCodigo: string;
  lon: number | null;
  lat: number | null;
}

export interface DatosActualizarEdificio {
  nombre?: string;
  alias?: string[];
  uso?: UsoEdificio;
  pisos?: number;
  ascensor?: boolean;
  descripcion?: string | null;
}

export interface UnidadCentroModel {
  id: number;
  codigo: string;
  nombre: string;
  sigla: string | null;
  facultadCodigo: string | null;
  facultadNombre: string | null;
}
