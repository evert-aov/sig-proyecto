import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CentroInterno, RutaCalculada } from '../../../../core/models/sig.models';
import { PuntoRuta } from '../../../../core/state/rutas-state.facade';

@Component({
  selector: 'app-rutas-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rutas-panel.component.html',
  styleUrl: './rutas-panel.component.scss',
})
export class RutasPanelComponent {
  readonly origen = input.required<PuntoRuta>();
  readonly destino = input<PuntoRuta | null>(null);
  readonly centros = input<CentroInterno[]>([]);
  readonly soloAccesible = input(false);
  readonly radioM = input(50);
  readonly seleccionandoEnMapa = input(false);
  readonly calculando = input(false);
  readonly ruta = input<RutaCalculada | null>(null);
  readonly error = input<string | null>(null);

  readonly usarGps = output<void>();
  readonly usarEntradaCU = output<void>();
  readonly activarSeleccionMapa = output<void>();
  readonly seleccionarCentroDestino = output<CentroInterno>();
  readonly cambiarAccesible = output<boolean>();
  readonly cambiarRadio = output<number>();
  readonly calcular = output<void>();
  readonly limpiar = output<void>();

  onSelectCentro(codigo: string): void {
    const found = this.centros().find((c) => c.codigo === codigo);
    if (found) {
      this.seleccionarCentroDestino.emit(found);
    }
  }
}
