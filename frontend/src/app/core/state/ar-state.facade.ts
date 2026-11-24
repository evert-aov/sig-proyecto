import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SigApiService } from '../api/sig-api.service';
import { ArPuntoCercano, CentroInterno } from '../models/sig.models';
import { GeolocationService } from '../services/geolocation.service';
import { LocarEngineService } from '../services/locar-engine.service';
import { TurfSpatialService } from '../services/turf-spatial.service';

@Injectable({ providedIn: 'root' })
export class ArStateFacade {
  private readonly api = inject(SigApiService);
  private readonly geo = inject(GeolocationService);
  private readonly turf = inject(TurfSpatialService);
  private readonly locarEngine = inject(LocarEngineService);

  readonly todosCentros = signal<CentroInterno[]>([]);
  readonly radioVisibilidadM = signal(500);
  readonly rumboSimuladoGrados = signal(0);
  readonly camaraActiva = signal(false);
  readonly estadoMensaje = signal('Inicializando visor AR...');
  readonly centroEnfocado = signal<CentroInterno | null>(null);
  readonly cargando = signal(false);

  readonly posicionActual = this.geo.posicion;

  readonly puntosCercanos = computed<ArPuntoCercano[]>(() => {
    const pos = this.geo.posicion();
    return this.turf.ordenarCentrosPorCercania(
      pos.lon,
      pos.lat,
      this.todosCentros(),
      this.radioVisibilidadM(),
    );
  });

  async inicializarEscena(hostEl: HTMLElement): Promise<void> {
    this.cargando.set(true);
    try {
      const centros = await firstValueFrom(this.api.listarCentrosInternos());
      this.todosCentros.set(centros);

      this.locarEngine.iniciar(hostEl, {
        onCentroDetectado: (codigo) => void this.enfocarCentro(codigo),
        onEstadoCamara: (activa, detalle) => {
          this.camaraActiva.set(activa);
          this.estadoMensaje.set(detalle);
        },
      });

      this.sincronizarEscena();
    } finally {
      this.cargando.set(false);
    }
  }

  async activarGpsReal(): Promise<void> {
    await this.geo.solicitarUbicacionReal();
    this.sincronizarEscena();
  }

  simularPosicionCampus(lon = -63.1952, lat = -17.7762): void {
    this.geo.establecerSimulada(lon, lat);
    this.sincronizarEscena();
  }

  cambiarRumboSimulado(grados: number): void {
    this.rumboSimuladoGrados.set(grados);
    this.locarEngine.setRumboSimulado(grados);
  }

  cambiarRadioVisibilidad(metros: number): void {
    this.radioVisibilidadM.set(metros);
    this.sincronizarEscena();
  }

  async enfocarCentro(codigo: string): Promise<void> {
    const detalle = await firstValueFrom(this.api.obtenerCentroInterno(codigo));
    this.centroEnfocado.set(detalle);
  }

  cerrarFicha(): void {
    this.centroEnfocado.set(null);
  }

  detenerEscena(): void {
    this.locarEngine.detener();
  }

  private sincronizarEscena(): void {
    const pos = this.geo.posicion();
    const cercanos = this.puntosCercanos();
    this.locarEngine.actualizarPosicionYMarcadores(
      pos.lon,
      pos.lat,
      cercanos,
      !pos.simulada,
    );
    const primero = cercanos[0];
    if (primero) {
      if (!this.centroEnfocado()) {
        this.centroEnfocado.set(primero.centro);
      }
      if (pos.simulada && this.rumboSimuladoGrados() === 0) {
        this.cambiarRumboSimulado(primero.rumboGrados);
      }
    }
  }
}
