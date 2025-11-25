import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-leverage-and-collateralization',
  templateUrl: './leverage-and-collateralization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeverageAndCollateralizationComponent extends BasePageComponent {}
