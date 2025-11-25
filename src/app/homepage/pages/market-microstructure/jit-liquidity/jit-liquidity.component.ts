import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-jit-liquidity',
  templateUrl: './jit-liquidity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitLiquidityComponent extends BasePageComponent {}
