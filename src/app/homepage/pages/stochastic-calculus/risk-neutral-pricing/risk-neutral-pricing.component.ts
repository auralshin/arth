import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-risk-neutral-pricing',
  templateUrl: './risk-neutral-pricing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskNeutralPricingComponent extends BasePageComponent {}
