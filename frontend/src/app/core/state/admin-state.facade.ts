import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CrearCentroPayload, SigApiService } from '../api/sig-api.service';
import {
  CentroInterno,
  EdificioResumen,
  QaTopologica,
  ResumenSuperficieSede,
  Sede,
  UnidadCentro,
} from '../models/sig.models';

@Injectable({ providedIn: 'root' })
export class AdminStateFacade {
  private readonly api = inject(SigApiService);

  readonly centros = signal<CentroInterno[]>([]);
  readonly edificios = signal<EdificioResumen[]>([]);
  readonly unidades = signal<UnidadCentro[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly resumenEspacial = signal<ResumenSuperficieSede[]>([]);
  readonly qaTopologica = signal<QaTopologica | null>(null);

  readonly cargando = signal(false);
  readonly mensajeOk = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  async cargarTodo(): Promise<void> {
    this.cargando.set(true);
    try {
      const [centros, edificios, unidades, sedes, resumen, qa] = await Promise.all([
        firstValueFrom(this.api.listarCentrosInternos()),
        firstValueFrom(this.api.obtenerEdificios()),
        firstValueFrom(this.api.obtenerUnidadesCentro()),
        firstValueFrom(this.api.obtenerSedes()),
        firstValueFrom(this.api.obtenerResumenEspacial()),
        firstValueFrom(this.api.obtenerQaTopologica()),
      ]);
      this.centros.set(centros);
      this.edificios.set(edificios);
      this.unidades.set(unidades);
      this.sedes.set(sedes);
      this.resumenEspacial.set(resumen);
      this.qaTopologica.set(qa);
    } finally {
      this.cargando.set(false);
    }
  }

  async crearCentro(payload: CrearCentroPayload): Promise<boolean> {
    this.limpiarMensajes();
    try {
      await firstValueFrom(this.api.crearCentroInterno(payload));
      this.mensajeOk.set(`Centro Interno ${payload.codigo} creado correctamente.`);
      await this.cargarTodo();
      return true;
    } catch (err: unknown) {
      this.mensajeError.set(this.extraerError(err));
      return false;
    }
  }

  async eliminarCentro(codigo: string): Promise<void> {
    this.limpiarMensajes();
    try {
      await firstValueFrom(this.api.eliminarCentroInterno(codigo));
      this.mensajeOk.set(`Centro Interno ${codigo} eliminado.`);
      await this.cargarTodo();
    } catch (err: unknown) {
      this.mensajeError.set(this.extraerError(err));
    }
  }

  async subirFoto(
    ambienteCodigo: string,
    tipo: 'fachada' | 'puerta' | 'interior' | 'referencia',
    principal: boolean,
    archivo: File,
  ): Promise<boolean> {
    this.limpiarMensajes();
    const form = new FormData();
    form.append('ambienteCodigo', ambienteCodigo);
    form.append('tipo', tipo);
    form.append('principal', String(principal));
    form.append('archivo', archivo);
    try {
      await firstValueFrom(this.api.subirFoto(form));
      this.mensajeOk.set(`Foto subida bajo CINT/${ambienteCodigo}.`);
      await this.cargarTodo();
      return true;
    } catch (err: unknown) {
      this.mensajeError.set(this.extraerError(err));
      return false;
    }
  }

  limpiarMensajes(): void {
    this.mensajeOk.set(null);
    this.mensajeError.set(null);
  }

  private extraerError(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const inner = (err as { error?: { message?: string | string[] } }).error;
      if (Array.isArray(inner?.message)) return inner.message.join(', ');
      if (typeof inner?.message === 'string') return inner.message;
    }
    return 'No se pudo completar la operación.';
  }
}
