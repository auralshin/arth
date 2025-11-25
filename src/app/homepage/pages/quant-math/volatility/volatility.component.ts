import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-volatility',
  templateUrl: './volatility.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolatilityComponent extends BasePageComponent {}
