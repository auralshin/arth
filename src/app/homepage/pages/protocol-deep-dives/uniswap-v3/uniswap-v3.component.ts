import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-uniswap-v3',
  templateUrl: './uniswap-v3.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniswapV3Component extends BasePageComponent {}
