import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-liquidity-cycles',
  templateUrl: './liquidity-cycles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidityCyclesComponent extends BasePageComponent {}
