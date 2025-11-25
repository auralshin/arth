import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-leverage-liquidation',
  templateUrl: './leverage-liquidation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeverageLiquidationComponent extends BasePageComponent {}
