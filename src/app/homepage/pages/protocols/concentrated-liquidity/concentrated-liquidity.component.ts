import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-concentrated-liquidity',
  templateUrl: './concentrated-liquidity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcentratedLiquidityComponent extends BasePageComponent {}
