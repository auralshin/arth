import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-collateral-math',
  templateUrl: './collateral-math.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollateralMathComponent extends BasePageComponent {}
