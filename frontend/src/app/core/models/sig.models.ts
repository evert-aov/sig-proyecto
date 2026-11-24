export type GeoJsonGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'LineString'; coordinates: [number, number][] }
  | { type: 'MultiPolygon'; coordinates: [number, number][][][] }
  | { type: 'Polygon'; coordinates: [number, number][][] };

export interface GeoJsonFeature<TProps = Record<string, unknown>> {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJsonGeometry;
  properties: TProps;
}

export interface GeoJsonFeatureCollection<TProps = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: GeoJsonFeature<TProps>[];
}

export interface FotoResumen {
  id: number;
  ruta: string;
  tipo: 'fachada' | 'puerta' | 'interior' | 'referencia';
  principal: boolean;
  descripcion: string | null;
  tomadaEn: string | null;
}

export interface CentroInterno {
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

export interface LeyendaItem {
  capa: string;
  codigo: string;
  nombre: string;
  categoria: string;
  color: string;
  icono: string;
  orden: number;
  descripcion: string | null;
}

export interface Facultad {
  id: number;
  codigo: string;
  nombre: string;
  sigla: string | null;
  alias: string[];
  totalCentrosInternos: number;
}

export interface Sede {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  municipio: string;
  direccion: string | null;
  areaM2: number | null;
}

export interface EdificioResumen {
  id: number;
  codigo: string;
  nombre: string;
  uso: string;
  pisos: number;
  ascensor: boolean;
  areaM2: number | null;
  sedeCodigo: string;
  lon: number | null;
  lat: number | null;
}

export interface UnidadCentro {
  id: number;
  codigo: string;
  nombre: string;
  sigla: string | null;
  facultadCodigo: string | null;
  facultadNombre: string | null;
}

export interface BusquedaResultado {
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

export interface TramoRuta {
  codigo: string;
  nombre: string;
  superficie: string | null;
  techado: boolean;
  accesible: boolean;
  longitud_m: number;
}

export interface ElementoSeguridadProps {
  capa: string;
  codigo: string;
  nombre: string;
  tipo_codigo: string;
  tipo_nombre: string;
  categoria: string;
  color: string;
  icono: string;
  piso: number;
  accesible: boolean;
  nota: string | null;
  extintor_agente: string | null;
  extintor_kg: number | null;
  extintor_vence: string | null;
  distancia_ruta_m: number;
}

export interface RutaCalculada {
  encontrada: boolean;
  mensaje?: string;
  solo_accesible?: boolean;
  radio_m?: number;
  nodo_inicio?: number;
  nodo_fin?: number;
  distancia_m?: number;
  tiempo_estimado_min?: number;
  ruta_geojson?: GeoJsonFeature;
  tramos?: TramoRuta[];
  elementos_cercanos?: GeoJsonFeatureCollection<ElementoSeguridadProps>;
}

export interface ResumenSuperficieSede {
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

export interface QaTopologica {
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

export interface ArPuntoCercano {
  centro: CentroInterno;
  distanciaM: number;
  rumboGrados: number;
  cardinal: string;
}

export interface AuthUsuario {
  id: number;
  correo: string;
  nombre: string;
  rol: string;
  grupoId: number;
}

export interface LoginResponse {
  accessToken: string;
  usuario: AuthUsuario;
}
