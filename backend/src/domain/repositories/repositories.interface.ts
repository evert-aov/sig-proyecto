import { FiltroCapas, GeoJsonFeatureCollection, NombreCapa } from '../models/geojson.model';
import {
  CentroInternoModel,
  DatosActualizarCentroInterno,
  DatosCrearCentroInterno,
  FiltroCentrosInternos,
  FotoResumen,
} from '../models/centro-interno.model';
import {
  EdificioResumenModel,
  FacultadModel,
  LeyendaItemModel,
  SedeModel,
  UnidadCentroModel,
} from '../models/catalogo.model';
import {
  BusquedaResultadoModel,
  QaTopologicaModel,
  ResumenSuperficieSedeModel,
  RutaCalculadaModel,
  UsuarioAppModel,
} from '../models/espacial-y-seguridad.model';

export const CAPAS_REPOSITORY = Symbol('CAPAS_REPOSITORY');
export const CENTROS_INTERNOS_REPOSITORY = Symbol('CENTROS_INTERNOS_REPOSITORY');
export const CATALOGO_REPOSITORY = Symbol('CATALOGO_REPOSITORY');
export const BUSQUEDA_REPOSITORY = Symbol('BUSQUEDA_REPOSITORY');
export const RUTAS_REPOSITORY = Symbol('RUTAS_REPOSITORY');
export const ESPACIAL_REPOSITORY = Symbol('ESPACIAL_REPOSITORY');
export const FOTOS_REPOSITORY = Symbol('FOTOS_REPOSITORY');
export const USUARIOS_REPOSITORY = Symbol('USUARIOS_REPOSITORY');

export interface ICapasRepository {
  obtenerGeoJson(capa: NombreCapa, filtro: FiltroCapas): Promise<GeoJsonFeatureCollection>;
}

export interface ICentrosInternosRepository {
  listar(filtro: FiltroCentrosInternos): Promise<CentroInternoModel[]>;
  obtenerPorCodigo(codigo: string): Promise<CentroInternoModel | null>;
  crear(datos: DatosCrearCentroInterno): Promise<CentroInternoModel>;
  actualizar(codigo: string, datos: DatosActualizarCentroInterno): Promise<CentroInternoModel | null>;
  eliminar(codigo: string): Promise<boolean>;
}

export interface ICatalogoRepository {
  obtenerLeyenda(): Promise<LeyendaItemModel[]>;
  obtenerFacultades(): Promise<FacultadModel[]>;
  obtenerSedes(): Promise<SedeModel[]>;
  obtenerEdificios(): Promise<EdificioResumenModel[]>;
  obtenerUnidadesCentro(): Promise<UnidadCentroModel[]>;
}

export interface IBusquedaRepository {
  buscar(texto: string): Promise<BusquedaResultadoModel[]>;
}

export interface IRutasRepository {
  calcularRuta(
    oLon: number,
    oLat: number,
    dLon: number,
    dLat: number,
    soloAccesible: boolean,
    radioM: number,
  ): Promise<RutaCalculadaModel>;
}

export interface IEspacialRepository {
  obtenerResumenSuperficies(): Promise<ResumenSuperficieSedeModel[]>;
  obtenerQaTopologica(): Promise<QaTopologicaModel>;
  obtenerAmbientesEnSede(sedeCodigo: string): Promise<GeoJsonFeatureCollection>;
}

export interface DatosRegistrarFoto {
  ambienteCodigo: string;
  ruta: string;
  tipo: 'fachada' | 'puerta' | 'interior' | 'referencia';
  principal: boolean;
  descripcion?: string;
  grupoId: number;
}

export interface IFotosRepository {
  registrarFotoAmbiente(datos: DatosRegistrarFoto): Promise<FotoResumen>;
  obtenerPorId(id: number): Promise<FotoResumen | null>;
  eliminar(id: number): Promise<boolean>;
}

export interface IUsuariosRepository {
  buscarPorCorreo(correo: string): Promise<UsuarioAppModel | null>;
  buscarPorId(id: number): Promise<UsuarioAppModel | null>;
}
