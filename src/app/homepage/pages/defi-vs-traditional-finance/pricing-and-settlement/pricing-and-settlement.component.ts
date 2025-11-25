import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pricing-and-settlement',
  templateUrl: './pricing-and-settlement.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingAndSettlementComponent extends BasePageComponent {}
