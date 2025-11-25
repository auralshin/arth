import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lp-volatility',
  templateUrl: './lp-volatility.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LpVolatilityComponent extends BasePageComponent {}
