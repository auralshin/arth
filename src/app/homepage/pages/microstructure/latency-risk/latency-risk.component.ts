import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-latency-risk',
  templateUrl: './latency-risk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatencyRiskComponent extends BasePageComponent {}
