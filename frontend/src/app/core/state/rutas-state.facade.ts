import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SigApiService } from '../api/sig-api.service';
import { CentroInterno, RutaCalculada } from '../models/sig.models';
import { GeolocationService } from '../services/geolocation.service';
import { MaplibreEngineService } from '../services/maplibre-engine.service';
import { TurfSpatialService } from '../services/turf-spatial.service';

export interface PuntoRuta {
  etiqueta: string;
  lon: number;
  lat: number;
}

@Injectable({ providedIn: 'root' })
export class RutasStateFacade {
  private readonly api = inject(SigApiService);
  private readonly geo = inject(GeolocationService);
  private readonly mapEngine = inject(MaplibreEngineService);
  private readonly turf = inject(TurfSpatialService);

  readonly origen = signal<PuntoRuta>({
    etiqueta: 'Entrada Oeste CU (Av. Busch)',
    lon: -63.1966,
    lat: -17.7762,
  });
  readonly destino = signal<PuntoRuta | null>(null);
  readonly soloAccesible = signal(false);
  readonly radioM = signal(50);
  readonly seleccionandoEnMapa = signal(false);
  readonly calculando = signal(false);
  readonly ruta = signal<RutaCalculada | null>(null);
  readonly error = signal<string | null>(null);

  async usarMiUbicacionComoOrigen(): Promise<void> {
    const pos = await this.geo.solicitarUbicacionReal();
    this.origen.set({
      etiqueta: pos.simulada
        ? 'Posición de respaldo UAGRM (Entrada Oeste CU)'
        : `Mi ubicación GPS (${pos.precisionM ?? '?'} m precisión)`,
      lon: pos.lon,
      lat: pos.lat,
    });
    this.mapEngine.actualizarFuente('usuario', {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [pos.lon, pos.lat] },
      properties: { simulada: pos.simulada },
    });
  }

  usarEntradaOesteCU(): void {
    this.origen.set({
      etiqueta: 'Entrada Oeste CU (Av. Busch)',
      lon: -63.1966,
      lat: -17.7762,
    });
    this.seleccionandoEnMapa.set(false);
  }

  establecerOrigenCoordenada(lon: number, lat: number, etiqueta = 'Punto seleccionado en el mapa'): void {
    this.origen.set({ etiqueta, lon, lat });
    this.seleccionandoEnMapa.set(false);
  }

  async trazarHaciaCentro(centro: CentroInterno): Promise<void> {
    this.destino.set({
      etiqueta: `${centro.unidadSigla ?? centro.codigo} — ${centro.nombre}`,
      lon: centro.lon,
      lat: centro.lat,
    });
    await this.calcular();
  }

  async calcular(): Promise<void> {
    const orig = this.origen();
    const dest = this.destino();
    if (!dest) {
      this.error.set('Seleccione un Centro Interno como destino.');
      return;
    }

    this.calculando.set(true);
    this.error.set(null);

    try {
      const res = await firstValueFrom(
        this.api.calcularRuta(
          orig.lon,
          orig.lat,
          dest.lon,
          dest.lat,
          this.soloAccesible(),
          this.radioM(),
        ),
      );
      this.ruta.set(res);

      if (res.encontrada && res.ruta_geojson) {
        this.mapEngine.actualizarFuente('ruta', res.ruta_geojson);
        const buffer = this.turf.crearBufferCorredor(res.ruta_geojson, this.radioM());
        this.mapEngine.actualizarFuente('ruta-buffer', buffer);
        this.mapEngine.actualizarFuente('ruta-seguridad', res.elementos_cercanos ?? null);
        this.mapEngine.actualizarFuente('ruta-extremos', {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [orig.lon, orig.lat] },
              properties: { rol: 'origen', etiqueta: 'Inicio' },
            },
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [dest.lon, dest.lat] },
              properties: { rol: 'destino', etiqueta: 'Destino' },
            },
          ],
        });
        this.mapEngine.volarA((orig.lon + dest.lon) / 2, (orig.lat + dest.lat) / 2, 17.5);
      } else {
        this.limpiarCapaRuta();
        this.error.set(res.mensaje ?? 'No se encontró una ruta conectada.');
      }
    } finally {
      this.calculando.set(false);
    }
  }

  limpiar(): void {
    this.destino.set(null);
    this.ruta.set(null);
    this.error.set(null);
    this.limpiarCapaRuta();
  }

  private limpiarCapaRuta(): void {
    this.mapEngine.actualizarFuente('ruta', null);
    this.mapEngine.actualizarFuente('ruta-buffer', null);
    this.mapEngine.actualizarFuente('ruta-extremos', null);
    this.mapEngine.actualizarFuente('ruta-seguridad', null);
  }
}
