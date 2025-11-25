import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-uniswap-v2',
  templateUrl: './uniswap-v2.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniswapV2Component extends BasePageComponent {}
