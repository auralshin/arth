import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-uniswap-v3-lp',
  templateUrl: './uniswap-v3-lp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniswapV3LpComponent extends BasePageComponent {}
