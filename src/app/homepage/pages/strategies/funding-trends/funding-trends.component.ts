import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-funding-trends',
  templateUrl: './funding-trends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundingTrendsComponent extends BasePageComponent {}
