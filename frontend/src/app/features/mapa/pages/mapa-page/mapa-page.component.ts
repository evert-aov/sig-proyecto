import { Component, OnInit, inject, signal } from '@angular/core';
import { CentroInterno } from '../../../../core/models/sig.models';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { MaplibreEngineService } from '../../../../core/services/maplibre-engine.service';
import { MapaStateFacade } from '../../../../core/state/mapa-state.facade';
import { RutasStateFacade } from '../../../../core/state/rutas-state.facade';
import { CentroDetalleComponent } from '../../components/centro-detalle/centro-detalle.component';
import { FiltrosPanelComponent } from '../../components/filtros-panel/filtros-panel.component';
import { LeyendaPanelComponent } from '../../components/leyenda-panel/leyenda-panel.component';
import { MapaVisorComponent } from '../../components/mapa-visor/mapa-visor.component';
import { RutasPanelComponent } from '../../components/rutas-panel/rutas-panel.component';

type TabSidebar = 'centros' | 'rutas' | 'leyenda';

@Component({
  selector: 'app-mapa-page',
  standalone: true,
  imports: [
    MapaVisorComponent,
    FiltrosPanelComponent,
    CentroDetalleComponent,
    RutasPanelComponent,
    LeyendaPanelComponent,
  ],
  templateUrl: './mapa-page.component.html',
  styleUrl: './mapa-page.component.scss',
})
export class MapaPageComponent implements OnInit {
  readonly mapaState = inject(MapaStateFacade);
  readonly rutasState = inject(RutasStateFacade);
  private readonly geo = inject(GeolocationService);
  private readonly mapEngine = inject(MaplibreEngineService);

  readonly tabActiva = signal<TabSidebar>('centros');
  readonly panelMovilAbierto = signal(false);
  readonly estadoUbicacion = signal<string | null>(null);

  ngOnInit(): void {
    void this.mapaState.cargarCatalogosIniciales();
  }

  abrirTabMovil(tab: TabSidebar): void {
    if (this.panelMovilAbierto() && this.tabActiva() === tab) {
      this.panelMovilAbierto.set(false);
      return;
    }
    this.tabActiva.set(tab);
    this.panelMovilAbierto.set(true);
  }

  cerrarPanelMovil(): void {
    this.panelMovilAbierto.set(false);
  }

  onCentroClick(codigo: string): void {
    this.panelMovilAbierto.set(false);
    void this.mapaState.seleccionarCentro(codigo, true);
  }

  onMapaClick(coords: { lon: number; lat: number }): void {
    if (this.rutasState.seleccionandoEnMapa()) {
      this.rutasState.establecerOrigenCoordenada(coords.lon, coords.lat);
      if (this.rutasState.destino()) {
        void this.rutasState.calcular();
      }
    }
  }

  async onSolicitarGps(): Promise<void> {
    const pos = await this.geo.solicitarUbicacionReal();
    this.mapEngine.actualizarFuente('usuario', {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [pos.lon, pos.lat] },
      properties: { simulada: pos.simulada },
    });
    this.mapEngine.volarA(pos.lon, pos.lat, 18.2);
    this.estadoUbicacion.set(
      pos.simulada
        ? 'GPS real no disponible o sin permiso: usando punto de respaldo UAGRM.'
        : `Ubicación GPS detectada (±${pos.precisionM ?? '?'} m).`,
    );
  }

  onCentrarCampus(sedeCodigo: string): void {
    if (sedeCodigo === 'CAMPUS') {
      this.mapEngine.volarA(-63.1926, -17.7784, 17.6);
    } else {
      this.mapEngine.volarA(-63.1953, -17.7762, 17.2);
    }
  }

  onTrazarRutaACentro(centro: CentroInterno): void {
    this.tabActiva.set('rutas');
    this.panelMovilAbierto.set(true);
    void this.rutasState.trazarHaciaCentro(centro);
  }

  onCalcularRuta(): void {
    void this.rutasState.calcular();
    this.panelMovilAbierto.set(false);
  }

  onActivarSeleccionMapa(): void {
    const next = !this.rutasState.seleccionandoEnMapa();
    this.rutasState.seleccionandoEnMapa.set(next);
    if (next) {
      this.panelMovilAbierto.set(false);
    }
  }
}
