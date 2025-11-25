import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-liquidity',
  templateUrl: './liquidity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidityComponent extends BasePageComponent {}
