import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-performance-metrics',
  templateUrl: './performance-metrics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceMetricsComponent extends BasePageComponent {}
