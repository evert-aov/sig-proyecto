import { GeoJsonFeatureCollection, GeoJsonGeometry } from './geojson.model';

export interface TramoRutaModel {
  codigo: string;
  nombre: string;
  superficie: string | null;
  techado: boolean;
  accesible: boolean;
  longitud_m: number;
}

export interface RutaCalculadaModel {
  encontrada: boolean;
  mensaje?: string;
  solo_accesible?: boolean;
  radio_m?: number;
  nodo_inicio?: number;
  nodo_fin?: number;
  distancia_m?: number;
  tiempo_estimado_min?: number;
  ruta_geojson?: {
    type: 'Feature';
    geometry: GeoJsonGeometry;
    properties: Record<string, unknown>;
  };
  tramos?: TramoRutaModel[];
  elementos_cercanos?: GeoJsonFeatureCollection;
}

export interface BusquedaResultadoModel {
  entidad: 'ambiente' | 'edificio';
  id: number;
  codigo: string;
  nombre: string;
  subtitulo: string;
  categoria: string;
  color: string;
  sedeCodigo: string | null;
  facultadNombre: string | null;
  lon: number;
  lat: number;
  relevancia: number;
}

export interface ResumenSuperficieSedeModel {
  sedeCodigo: string;
  sedeNombre: string;
  superficieSedeM2: number;
  totalEdificios: number;
  superficieEdificiosM2: number;
  totalAreas: number;
  superficieAreasM2: number;
  longitudViasM: number;
  totalCentrosInternos: number;
}

export interface QaTopologicaModel {
  ambientesFueraDeEdificio: Array<{
    id: number;
    codigo: string;
    nombre: string;
    edificioCodigo: string;
    distanciaM: number;
  }>;
  viasDesconectadas: Array<{
    id: number;
    codigo: string;
    nombre: string | null;
  }>;
  entradasSinVia: Array<{
    id: number;
    codigo: string;
    nombre: string | null;
    distanciaViaM: number;
  }>;
}

export interface UsuarioAppModel {
  id: number;
  correo: string;
  nombre: string;
  passwordHash: string;
  rol: 'admin' | 'editor';
  grupoId: number;
  activo: boolean;
}
