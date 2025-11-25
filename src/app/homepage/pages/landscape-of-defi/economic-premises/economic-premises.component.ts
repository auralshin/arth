import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-economic-premises',
  templateUrl: './economic-premises.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EconomicPremisesComponent extends BasePageComponent {}
