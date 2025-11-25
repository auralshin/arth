import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stochastic',
  templateUrl: './stochastic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StochasticComponent extends BasePageComponent {}
