import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BusquedaResultado,
  CentroInterno,
  Facultad,
  Sede,
} from '../../../../core/models/sig.models';

@Component({
  selector: 'app-filtros-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtros-panel.component.html',
  styleUrl: './filtros-panel.component.scss',
})
export class FiltrosPanelComponent {
  readonly facultades = input<Facultad[]>([]);
  readonly sedes = input<Sede[]>([]);
  readonly centros = input<CentroInterno[]>([]);
  readonly resultadosBusqueda = input<BusquedaResultado[]>([]);
  readonly facultadIdSeleccionada = input<number | null>(null);
  readonly sedeCodigoSeleccionada = input<string | null>(null);
  readonly soloSinEscaleras = input(false);
  readonly textoBusqueda = input('');
  readonly codigoSeleccionado = input<string | null>(null);

  readonly buscarTexto = output<string>();
  readonly cambiarFacultad = output<number | null>();
  readonly cambiarSede = output<string | null>();
  readonly cambiarAccesibilidad = output<boolean>();
  readonly seleccionarCentro = output<string>();
  readonly seleccionarBusqueda = output<BusquedaResultado>();

  onFacultadChange(val: string): void {
    this.cambiarFacultad.emit(val ? Number(val) : null);
  }

  onSedeChange(val: string): void {
    this.cambiarSede.emit(val || null);
  }
}
