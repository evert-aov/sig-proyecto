import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArPuntoCercano, CentroInterno } from '../../../../core/models/sig.models';
import { CoordenadaUsuario } from '../../../../core/services/geolocation.service';

@Component({
  selector: 'app-ar-hud',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './ar-hud.component.html',
  styleUrl: './ar-hud.component.scss',
})
export class ArHudComponent {
  readonly posicion = input.required<CoordenadaUsuario>();
  readonly camaraActiva = input(false);
  readonly estadoMensaje = input('');
  readonly puntosCercanos = input<ArPuntoCercano[]>([]);
  readonly centroEnfocado = input<CentroInterno | null>(null);
  readonly radioVisibilidadM = input(500);
  readonly rumboSimulado = input(0);

  readonly activarGps = output<void>();
  readonly simularCampus = output<void>();
  readonly cambiarRumbo = output<number>();
  readonly cambiarRadio = output<number>();
  readonly seleccionarCentro = output<string>();
  readonly cerrarFicha = output<void>();

  readonly mostrarAjustes = signal(false);
}
