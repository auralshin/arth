import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pnl-metrics',
  templateUrl: './pnl-metrics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PnlMetricsComponent extends BasePageComponent {}
