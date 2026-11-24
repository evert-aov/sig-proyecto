export interface FotoResumen {
  id: number;
  ruta: string;
  tipo: 'fachada' | 'puerta' | 'interior' | 'referencia';
  principal: boolean;
  descripcion: string | null;
  tomadaEn: string | null;
}

export interface CentroInternoModel {
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
  verificadoEn: string | null;
  grupoId: number;
  tipoCodigo: string;
  tipoNombre: string;
  categoria: string;
  color: string;
  icono: string;
  unidadId: number | null;
  unidadCodigo: string | null;
  unidadNombre: string | null;
  unidadSigla: string | null;
  unidadResponsable: string | null;
  unidadCorreo: string | null;
  facultadId: number | null;
  facultadCodigo: string | null;
  facultadNombre: string | null;
  facultadSigla: string | null;
  edificioId: number | null;
  edificioCodigo: string | null;
  edificioNombre: string | null;
  edificioPisos: number | null;
  edificioAscensor: boolean;
  sedeId: number | null;
  sedeCodigo: string | null;
  sedeNombre: string | null;
  llegadaSinEscaleras: boolean;
  fotoPrincipal: string | null;
  fotos: FotoResumen[];
  lon: number;
  lat: number;
}

export interface FiltroCentrosInternos {
  facultadId?: number;
  sedeCodigo?: string;
  soloSinEscaleras?: boolean;
  texto?: string;
}

export interface DatosCrearCentroInterno {
  codigo: string;
  nombre: string;
  alias: string[];
  piso: number;
  referencia?: string;
  encargado?: string;
  telefono?: string;
  horario?: string;
  servicios: string[];
  descripcion?: string;
  unidadCodigo?: string;
  edificioCodigo?: string;
  sedeCodigo?: string;
  lon: number;
  lat: number;
  grupoId: number;
}

export interface DatosActualizarCentroInterno {
  nombre?: string;
  alias?: string[];
  piso?: number;
  referencia?: string;
  encargado?: string;
  telefono?: string;
  horario?: string;
  servicios?: string[];
  descripcion?: string;
  unidadCodigo?: string;
  edificioCodigo?: string;
  lon?: number;
  lat?: number;
}
