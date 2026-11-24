import { Component, input, output } from '@angular/core';
import { LeyendaItem } from '../../../../core/models/sig.models';

export interface ToggleCapaItem {
  id: string;
  etiqueta: string;
  color: string;
}

@Component({
  selector: 'app-leyenda-panel',
  standalone: true,
  templateUrl: './leyenda-panel.component.html',
  styleUrl: './leyenda-panel.component.scss',
})
export class LeyendaPanelComponent {
  readonly leyenda = input<LeyendaItem[]>([]);
  readonly capasVisibles = input<Record<string, boolean>>({});
  readonly toggleCapa = output<string>();

  readonly capasControl: ToggleCapaItem[] = [
    { id: 'centros-internos', etiqueta: 'Centros Internos', color: '#cf222e' },
    { id: 'edificios', etiqueta: 'Edificios / Módulos (2D/3D)', color: '#475569' },
    { id: 'vias', etiqueta: 'Senderos y Vías Peatonales', color: '#a0522d' },
    { id: 'puntos-interes', etiqueta: 'Entradas, Extintores y Servicios', color: '#d1242f' },
    { id: 'areas', etiqueta: 'Canchas, Jardines y Parqueos', color: '#82c91e' },
    { id: 'sedes', etiqueta: 'Límites de Sede', color: '#1e40af' },
  ];
}
