import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActualizarEdificioPayload,
  AuthUsuario,
  BusquedaResultado,
  CentroInterno,
  EdificioResumen,
  Facultad,
  FotoResumen,
  GeoJsonFeatureCollection,
  LeyendaItem,
  LoginResponse,
  QaTopologica,
  ResumenSuperficieSede,
  RutaCalculada,
  Sede,
  UnidadCentro,
} from '../models/sig.models';

export interface CrearCentroPayload {
  codigo: string;
  nombre: string;
  alias?: string[];
  piso: number;
  referencia?: string;
  encargado?: string;
  telefono?: string;
  horario?: string;
  servicios?: string[];
  descripcion?: string;
  unidadCodigo?: string;
  edificioCodigo?: string;
  sedeCodigo?: string;
  lon: number;
  lat: number;
}

@Injectable({ providedIn: 'root' })
export class SigApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  obtenerCapa(
    capa: string,
    filtros: { facultadId?: number | null; sedeCodigo?: string | null; soloAccesible?: boolean } = {},
  ): Observable<GeoJsonFeatureCollection> {
    let params = new HttpParams();
    if (filtros.facultadId) params = params.set('facultadId', String(filtros.facultadId));
    if (filtros.sedeCodigo) params = params.set('sedeCodigo', filtros.sedeCodigo);
    if (filtros.soloAccesible) params = params.set('soloAccesible', 'true');
    return this.http.get<GeoJsonFeatureCollection>(`${this.base}/capas/${capa}`, { params });
  }

  listarCentrosInternos(filtros: {
    facultadId?: number | null;
    sedeCodigo?: string | null;
    soloSinEscaleras?: boolean;
    texto?: string;
  } = {}): Observable<CentroInterno[]> {
    let params = new HttpParams();
    if (filtros.facultadId) params = params.set('facultadId', String(filtros.facultadId));
    if (filtros.sedeCodigo) params = params.set('sedeCodigo', filtros.sedeCodigo);
    if (filtros.soloSinEscaleras) params = params.set('soloSinEscaleras', 'true');
    if (filtros.texto?.trim()) params = params.set('texto', filtros.texto.trim());
    return this.http.get<CentroInterno[]>(`${this.base}/centros-internos`, { params });
  }

  obtenerCentroInterno(codigo: string): Observable<CentroInterno> {
    return this.http.get<CentroInterno>(`${this.base}/centros-internos/${encodeURIComponent(codigo)}`);
  }

  crearCentroInterno(payload: CrearCentroPayload): Observable<CentroInterno> {
    return this.http.post<CentroInterno>(`${this.base}/centros-internos`, payload);
  }

  actualizarCentroInterno(codigo: string, payload: Partial<CrearCentroPayload>): Observable<CentroInterno> {
    return this.http.patch<CentroInterno>(
      `${this.base}/centros-internos/${encodeURIComponent(codigo)}`,
      payload,
    );
  }

  eliminarCentroInterno(codigo: string): Observable<{ eliminado: boolean }> {
    return this.http.delete<{ eliminado: boolean }>(
      `${this.base}/centros-internos/${encodeURIComponent(codigo)}`,
    );
  }

  obtenerLeyenda(): Observable<LeyendaItem[]> {
    return this.http.get<LeyendaItem[]>(`${this.base}/catalogo/leyenda`);
  }

  obtenerFacultades(): Observable<Facultad[]> {
    return this.http.get<Facultad[]>(`${this.base}/catalogo/facultades`);
  }

  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.base}/catalogo/sedes`);
  }

  obtenerEdificios(): Observable<EdificioResumen[]> {
    return this.http.get<EdificioResumen[]>(`${this.base}/catalogo/edificios`);
  }

  actualizarEdificio(
    codigo: string,
    payload: ActualizarEdificioPayload,
  ): Observable<EdificioResumen> {
    return this.http.patch<EdificioResumen>(
      `${this.base}/edificios/${encodeURIComponent(codigo)}`,
      payload,
    );
  }

  obtenerUnidadesCentro(): Observable<UnidadCentro[]> {
    return this.http.get<UnidadCentro[]>(`${this.base}/catalogo/unidades-centro`);
  }

  buscar(q: string): Observable<BusquedaResultado[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<BusquedaResultado[]>(`${this.base}/buscar`, { params });
  }

  calcularRuta(
    oLon: number,
    oLat: number,
    dLon: number,
    dLat: number,
    soloAccesible: boolean,
    radioM: number,
  ): Observable<RutaCalculada> {
    const params = new HttpParams()
      .set('oLon', String(oLon))
      .set('oLat', String(oLat))
      .set('dLon', String(dLon))
      .set('dLat', String(dLat))
      .set('soloAccesible', String(soloAccesible))
      .set('radioM', String(radioM));
    return this.http.get<RutaCalculada>(`${this.base}/rutas`, { params });
  }

  obtenerResumenEspacial(): Observable<ResumenSuperficieSede[]> {
    return this.http.get<ResumenSuperficieSede[]>(`${this.base}/espacial/resumen`);
  }

  obtenerQaTopologica(): Observable<QaTopologica> {
    return this.http.get<QaTopologica>(`${this.base}/espacial/qa`);
  }

  subirFoto(formData: FormData): Observable<FotoResumen> {
    return this.http.post<FotoResumen>(`${this.base}/fotos`, formData);
  }

  eliminarFoto(id: number): Observable<{ eliminada: boolean }> {
    return this.http.delete<{ eliminada: boolean }>(`${this.base}/fotos/${id}`);
  }

  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { correo, password });
  }

  obtenerPerfil(): Observable<AuthUsuario> {
    return this.http.get<AuthUsuario>(`${this.base}/auth/perfil`);
  }
}
