import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-metric-index',
  templateUrl: './metric-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricIndexComponent extends BasePageComponent {}
