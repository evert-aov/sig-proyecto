import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CentroInterno } from '../../../../core/models/sig.models';

@Component({
  selector: 'app-centro-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './centro-detalle.component.html',
  styleUrl: './centro-detalle.component.scss',
})
export class CentroDetalleComponent {
  readonly centro = input.required<CentroInterno>();
  readonly cerrar = output<void>();
  readonly trazarRuta = output<CentroInterno>();
}
