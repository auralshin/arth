import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-risk-distribution',
  templateUrl: './risk-distribution.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskDistributionComponent extends BasePageComponent {}
