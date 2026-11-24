import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SigApiService } from '../api/sig-api.service';
import {
  BusquedaResultado,
  CentroInterno,
  Facultad,
  GeoJsonFeatureCollection,
  LeyendaItem,
  Sede,
} from '../models/sig.models';
import { MaplibreEngineService } from '../services/maplibre-engine.service';

@Injectable({ providedIn: 'root' })
export class MapaStateFacade {
  private readonly api = inject(SigApiService);
  private readonly mapEngine = inject(MaplibreEngineService);

  readonly facultades = signal<Facultad[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly leyenda = signal<LeyendaItem[]>([]);
  readonly centrosInternos = signal<CentroInterno[]>([]);
  readonly centroSeleccionado = signal<CentroInterno | null>(null);
  readonly resultadosBusqueda = signal<BusquedaResultado[]>([]);

  readonly facultadIdFiltro = signal<number | null>(null);
  readonly sedeCodigoFiltro = signal<string | null>(null);
  readonly soloSinEscaleras = signal(false);
  readonly textoBusqueda = signal('');
  readonly modo3D = signal(false);
  readonly mapaBase = signal<'osm' | 'satelite'>('osm');
  readonly cargando = signal(false);

  readonly capasVisibles = signal<Record<string, boolean>>({
    sedes: true,
    areas: true,
    edificios: true,
    vias: true,
    'puntos-interes': true,
    'centros-internos': true,
  });

  readonly totalCentrosFiltrados = computed(() => this.centrosInternos().length);

  async cargarCatalogosIniciales(): Promise<void> {
    this.cargando.set(true);
    try {
      const [facultades, sedes, leyenda] = await Promise.all([
        firstValueFrom(this.api.obtenerFacultades()),
        firstValueFrom(this.api.obtenerSedes()),
        firstValueFrom(this.api.obtenerLeyenda()),
      ]);
      this.facultades.set(facultades);
      this.sedes.set(sedes);
      this.leyenda.set(leyenda);
      await this.recargarCapasYCentros();
    } finally {
      this.cargando.set(false);
    }
  }

  async recargarCapasYCentros(): Promise<void> {
    const facultadId = this.facultadIdFiltro();
    const sedeCodigo = this.sedeCodigoFiltro();
    const soloSinEscaleras = this.soloSinEscaleras();

    const [centros, fcCentros, fcEdificios, fcVias, fcPuntos, fcAreas, fcSedes] = await Promise.all([
      firstValueFrom(
        this.api.listarCentrosInternos({
          facultadId,
          sedeCodigo,
          soloSinEscaleras,
          texto: this.textoBusqueda(),
        }),
      ),
      firstValueFrom(
        this.api.obtenerCapa('centros-internos', {
          facultadId,
          sedeCodigo,
          soloAccesible: soloSinEscaleras,
        }),
      ),
      firstValueFrom(this.api.obtenerCapa('edificios', { facultadId, sedeCodigo })),
      firstValueFrom(this.api.obtenerCapa('vias', { sedeCodigo })),
      firstValueFrom(this.api.obtenerCapa('puntos-interes', { sedeCodigo })),
      firstValueFrom(this.api.obtenerCapa('areas', { sedeCodigo })),
      firstValueFrom(this.api.obtenerCapa('sedes', { sedeCodigo })),
    ]);

    this.centrosInternos.set(centros);
    this.actualizarFuenteMapa('sedes', fcSedes);
    this.actualizarFuenteMapa('areas', fcAreas);
    this.actualizarFuenteMapa('edificios', fcEdificios);
    this.actualizarFuenteMapa('vias', fcVias);
    this.actualizarFuenteMapa('puntos-interes', fcPuntos);
    this.actualizarFuenteMapa('centros-internos', fcCentros);
  }

  async seleccionarCentro(codigo: string, centrarMapa = true): Promise<void> {
    const detalle = await firstValueFrom(this.api.obtenerCentroInterno(codigo));
    this.centroSeleccionado.set(detalle);
    this.mapEngine.actualizarFuente('centro-seleccionado', {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [detalle.lon, detalle.lat] },
      properties: { codigo: detalle.codigo, nombre: detalle.nombre },
    });
    if (centrarMapa) {
      this.mapEngine.volarA(detalle.lon, detalle.lat, 18.6);
    }
  }

  limpiarSeleccion(): void {
    this.centroSeleccionado.set(null);
    this.mapEngine.actualizarFuente('centro-seleccionado', null);
  }

  async aplicarFiltros(filtros: {
    facultadId?: number | null;
    sedeCodigo?: string | null;
    soloSinEscaleras?: boolean;
    texto?: string;
  }): Promise<void> {
    if (filtros.facultadId !== undefined) this.facultadIdFiltro.set(filtros.facultadId);
    if (filtros.sedeCodigo !== undefined) this.sedeCodigoFiltro.set(filtros.sedeCodigo);
    if (filtros.soloSinEscaleras !== undefined) this.soloSinEscaleras.set(filtros.soloSinEscaleras);
    if (filtros.texto !== undefined) this.textoBusqueda.set(filtros.texto);

    await this.recargarCapasYCentros();

    if (filtros.sedeCodigo === 'CAMPUS') {
      this.mapEngine.volarA(-63.1926, -17.7784, 17.5);
    } else if (filtros.sedeCodigo === 'CU') {
      this.mapEngine.volarA(-63.1953, -17.7762, 17.2);
    }
  }

  async buscarTextoGlobal(q: string): Promise<void> {
    this.textoBusqueda.set(q);
    if (!q.trim()) {
      this.resultadosBusqueda.set([]);
      await this.recargarCapasYCentros();
      return;
    }
    const res = await firstValueFrom(this.api.buscar(q));
    this.resultadosBusqueda.set(res);
  }

  async seleccionarResultadoBusqueda(item: BusquedaResultado): Promise<void> {
    this.resultadosBusqueda.set([]);
    this.mapEngine.volarA(item.lon, item.lat, 18.5);
    if (item.entidad === 'ambiente') {
      try {
        await this.seleccionarCentro(item.codigo, false);
      } catch {
        // Puede ser otro tipo de ambiente (ej. consultorio)
      }
    }
  }

  toggle3D(): void {
    const next = !this.modo3D();
    this.modo3D.set(next);
    this.mapEngine.alternar3D(next);
  }

  toggleMapaBase(): void {
    const next = this.mapaBase() === 'osm' ? 'satelite' : 'osm';
    this.mapaBase.set(next);
    this.mapEngine.cambiarMapaBase(next);
  }

  toggleCapa(capa: string): void {
    const actual = { ...this.capasVisibles() };
    const next = !actual[capa];
    actual[capa] = next;
    this.capasVisibles.set(actual);
    this.mapEngine.setVisibilidadCapa(capa, next);
  }

  private actualizarFuenteMapa(nombre: string, fc: GeoJsonFeatureCollection): void {
    this.mapEngine.actualizarFuente(nombre, fc);
  }
}
