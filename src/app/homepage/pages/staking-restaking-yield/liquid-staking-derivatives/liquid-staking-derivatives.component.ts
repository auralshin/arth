import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-liquid-staking-derivatives',
  templateUrl: './liquid-staking-derivatives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidStakingDerivativesComponent extends BasePageComponent {}
