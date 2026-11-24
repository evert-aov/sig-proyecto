import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import { ArPuntoCercano, CentroInterno, GeoJsonFeature } from '../models/sig.models';

@Injectable({ providedIn: 'root' })
export class TurfSpatialService {
  distanciaMetros(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    return Math.round(turf.distance(from, to, { units: 'meters' }) * 10) / 10;
  }

  rumboGrados(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const bearing = turf.bearing(turf.point([lon1, lat1]), turf.point([lon2, lat2]));
    return Math.round((bearing + 360) % 360);
  }

  puntoCardinal(grados: number): string {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(grados / 45) % 8];
  }

  crearBufferCorredor(rutaFeature: GeoJsonFeature, radioM: number): GeoJsonFeature | null {
    if (rutaFeature.geometry.type !== 'LineString') {
      return null;
    }
    const line = turf.lineString(rutaFeature.geometry.coordinates);
    const buffered = turf.buffer(line, radioM, { units: 'meters' });
    if (!buffered) return null;
    return buffered as unknown as GeoJsonFeature;
  }

  ordenarCentrosPorCercania(
    lon: number,
    lat: number,
    centros: CentroInterno[],
    radioMaximoM = 1200,
  ): ArPuntoCercano[] {
    return centros
      .map((centro) => {
        const distanciaM = this.distanciaMetros(lon, lat, centro.lon, centro.lat);
        const rumboGrados = this.rumboGrados(lon, lat, centro.lon, centro.lat);
        return {
          centro,
          distanciaM,
          rumboGrados,
          cardinal: this.puntoCardinal(rumboGrados),
        };
      })
      .filter((item) => item.distanciaM <= radioMaximoM)
      .sort((a, b) => a.distanciaM - b.distanciaM);
  }

  encontrarMasCercano(lon: number, lat: number, centros: CentroInterno[]): ArPuntoCercano | null {
    const ordenados = this.ordenarCentrosPorCercania(lon, lat, centros, 100000);
    return ordenados[0] ?? null;
  }
}
