import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-funding-rate',
  templateUrl: './funding-rate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingRateComponent extends BasePageComponent {}
