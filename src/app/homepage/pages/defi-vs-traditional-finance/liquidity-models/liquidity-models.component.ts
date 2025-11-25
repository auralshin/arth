import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-liquidity-models',
  templateUrl: './liquidity-models.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidityModelsComponent extends BasePageComponent {}
