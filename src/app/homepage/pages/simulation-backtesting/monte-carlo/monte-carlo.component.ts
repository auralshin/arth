import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-monte-carlo',
  templateUrl: './monte-carlo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonteCarloComponent extends BasePageComponent {}
