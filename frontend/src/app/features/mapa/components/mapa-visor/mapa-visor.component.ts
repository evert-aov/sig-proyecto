import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, input, output } from '@angular/core';
import { MaplibreEngineService } from '../../../../core/services/maplibre-engine.service';

@Component({
  selector: 'app-mapa-visor',
  standalone: true,
  templateUrl: './mapa-visor.component.html',
  styleUrl: './mapa-visor.component.scss',
})
export class MapaVisorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLElement>;

  readonly modo3D = input(false);
  readonly mapaBase = input<'osm' | 'satelite'>('osm');
  readonly seleccionandoOrigen = input(false);
  readonly estadoUbicacion = input<string | null>(null);

  readonly centroClick = output<string>();
  readonly mapaClick = output<{ lon: number; lat: number }>();
  readonly toggle3D = output<void>();
  readonly toggleMapaBase = output<void>();
  readonly solicitarGps = output<void>();
  readonly centrarCampus = output<string>();

  constructor(private readonly mapEngine: MaplibreEngineService) {}

  ngAfterViewInit(): void {
    this.mapEngine.inicializar(this.mapContainer.nativeElement, {
      onCentroClick: (codigo) => this.centroClick.emit(codigo),
      onMapaClick: (lon, lat) => this.mapaClick.emit({ lon, lat }),
      isSeleccionandoOrigen: () => this.seleccionandoOrigen(),
    });
  }

  ngOnDestroy(): void {
    this.mapEngine.destruir();
  }
}
