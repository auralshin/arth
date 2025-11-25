import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-evolution-of-finance',
  templateUrl: './evolution-of-finance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionOfFinanceComponent extends BasePageComponent {}
