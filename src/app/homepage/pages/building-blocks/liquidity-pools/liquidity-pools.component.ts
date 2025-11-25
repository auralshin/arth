import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-liquidity-pools',
  templateUrl: './liquidity-pools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidityPoolsComponent extends BasePageComponent {}
