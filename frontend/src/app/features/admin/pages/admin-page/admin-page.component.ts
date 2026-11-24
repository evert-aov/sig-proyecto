import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdificioResumen } from '../../../../core/models/sig.models';
import { AdminStateFacade } from '../../../../core/state/admin-state.facade';
import { AuthStateFacade } from '../../../../core/state/auth-state.facade';

type UsoEdificio = 'academico' | 'administrativo' | 'servicios' | 'deportivo' | 'mixto';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
  readonly auth = inject(AuthStateFacade);
  readonly admin = inject(AdminStateFacade);

  readonly tab = signal<'centros' | 'edificios' | 'superficies' | 'qa'>('centros');

  correo = 'admin@uagrm.edu.bo';
  password = '';

  codigo = 'M236-CI-TEST';
  nombre = '';
  piso = 0;
  referencia = '';
  encargado = '';
  telefono = '';
  horario = 'Lun–Vie 08:30–12:30';
  serviciosTexto = 'Orientación estudiantil, Certificados';
  unidadCodigo = 'CI-FICCT-INF';
  edificioCodigo = 'M236';
  lon = -63.19555;
  lat = -17.7762;

  fotoCentroCodigo = 'M236-CI-INF';
  fotoTipo: 'fachada' | 'puerta' | 'interior' | 'referencia' = 'puerta';
  fotoPrincipal = true;
  fotoArchivo: File | null = null;

  // Edición descriptiva de edificio (sin modificar geometría)
  edifEditCodigo: string | null = null;
  edifEditSede = '';
  edifEditAreaM2: number | null = null;
  edifEditNombre = '';
  edifEditAliasTexto = '';
  edifEditUso: UsoEdificio = 'academico';
  edifEditPisos = 1;
  edifEditAscensor = false;
  edifEditDescripcion = '';

  ngOnInit(): void {
    void this.auth.restaurarSesion();
    void this.admin.cargarTodo();
  }

  async onLogin(): Promise<void> {
    await this.auth.login(this.correo, this.password);
  }

  onEdificioChange(codigo: string): void {
    this.edificioCodigo = codigo;
    const edif = this.admin.edificios().find((e) => e.codigo === codigo);
    if (edif?.lon && edif?.lat) {
      this.lon = Number(edif.lon.toFixed(6));
      this.lat = Number(edif.lat.toFixed(6));
    }
  }

  async onCrearCentro(): Promise<void> {
    const ok = await this.admin.crearCentro({
      codigo: this.codigo,
      nombre: this.nombre,
      piso: Number(this.piso),
      referencia: this.referencia || undefined,
      encargado: this.encargado || undefined,
      telefono: this.telefono || undefined,
      horario: this.horario || undefined,
      servicios: this.serviciosTexto
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      unidadCodigo: this.unidadCodigo || undefined,
      edificioCodigo: this.edificioCodigo || undefined,
      lon: Number(this.lon),
      lat: Number(this.lat),
    });
    if (ok) {
      this.nombre = '';
    }
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.fotoArchivo = input.files?.[0] ?? null;
  }

  async onSubirFoto(): Promise<void> {
    if (!this.fotoArchivo) return;
    await this.admin.subirFoto(this.fotoCentroCodigo, this.fotoTipo, this.fotoPrincipal, this.fotoArchivo);
  }

  seleccionarEdificioParaEditar(e: EdificioResumen): void {
    this.admin.limpiarMensajes();
    this.edifEditCodigo = e.codigo;
    this.edifEditSede = e.sedeCodigo;
    this.edifEditAreaM2 = e.areaM2;
    this.edifEditNombre = e.nombre;
    this.edifEditAliasTexto = (e.alias ?? []).join(', ');
    this.edifEditUso = (e.uso as UsoEdificio) || 'academico';
    this.edifEditPisos = e.pisos;
    this.edifEditAscensor = e.ascensor;
    this.edifEditDescripcion = e.descripcion ?? '';
  }

  cancelarEdicionEdificio(): void {
    this.edifEditCodigo = null;
  }

  async onGuardarEdificio(): Promise<void> {
    if (!this.edifEditCodigo) return;
    const alias = this.edifEditAliasTexto
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await this.admin.actualizarEdificio(this.edifEditCodigo, {
      nombre: this.edifEditNombre,
      alias,
      uso: this.edifEditUso,
      pisos: Number(this.edifEditPisos),
      ascensor: Boolean(this.edifEditAscensor),
      descripcion: this.edifEditDescripcion.trim() || null,
    });
  }
}
