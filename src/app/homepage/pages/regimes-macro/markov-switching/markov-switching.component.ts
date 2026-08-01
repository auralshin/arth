import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-markov-switching',
  templateUrl: './markov-switching.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkovSwitchingComponent extends BasePageComponent {}
