import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pancakeswap',
  templateUrl: './pancakeswap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PancakeswapComponent extends BasePageComponent {}
