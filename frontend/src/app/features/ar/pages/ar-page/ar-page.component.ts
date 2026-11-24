import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { ArStateFacade } from '../../../../core/state/ar-state.facade';
import { ArHudComponent } from '../../components/ar-hud/ar-hud.component';

@Component({
  selector: 'app-ar-page',
  standalone: true,
  imports: [ArHudComponent],
  templateUrl: './ar-page.component.html',
  styleUrl: './ar-page.component.scss',
})
export class ArPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('arHost', { static: true })
  private readonly arHost!: ElementRef<HTMLElement>;

  readonly arState = inject(ArStateFacade);

  ngAfterViewInit(): void {
    void this.arState.inicializarEscena(this.arHost.nativeElement);
  }

  ngOnDestroy(): void {
    this.arState.detenerEscena();
  }
}
