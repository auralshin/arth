import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-metrics-and-analytics-stack',
  templateUrl: './metrics-and-analytics-stack.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsAndAnalyticsStackComponent extends BasePageComponent {}
