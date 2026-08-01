import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-implied-volatility',
  templateUrl: './implied-volatility.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpliedVolatilityComponent extends BasePageComponent {}
