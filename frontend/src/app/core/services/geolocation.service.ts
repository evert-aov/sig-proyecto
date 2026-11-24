import { Injectable, signal } from '@angular/core';

export interface CoordenadaUsuario {
  lon: number;
  lat: number;
  precisionM: number | null;
  simulada: boolean;
}

// Ubicación por defecto: Entrada Oeste Ciudad Universitaria UAGRM
export const COORDENADA_UAGRM_DEFAULT: CoordenadaUsuario = {
  lon: -63.1966,
  lat: -17.7762,
  precisionM: 5,
  simulada: true,
};

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly posicion = signal<CoordenadaUsuario>(COORDENADA_UAGRM_DEFAULT);
  readonly error = signal<string | null>(null);
  readonly cargando = signal(false);

  solicitarUbicacionReal(): Promise<CoordenadaUsuario> {
    if (!('geolocation' in navigator)) {
      this.error.set('El navegador no soporta geolocalización. Usando punto de Campus UAGRM.');
      return Promise.resolve(this.posicion());
    }

    this.cargando.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord: CoordenadaUsuario = {
            lon: pos.coords.longitude,
            lat: pos.coords.latitude,
            precisionM: Math.round(pos.coords.accuracy),
            simulada: false,
          };
          this.posicion.set(coord);
          this.cargando.set(false);
          resolve(coord);
        },
        (err) => {
          this.error.set(`No se pudo obtener GPS (${err.message}). Usando ubicación simulada UAGRM.`);
          this.cargando.set(false);
          resolve(this.posicion());
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
      );
    });
  }

  establecerSimulada(lon: number, lat: number): void {
    this.error.set(null);
    this.posicion.set({ lon, lat, precisionM: 3, simulada: true });
  }
}
