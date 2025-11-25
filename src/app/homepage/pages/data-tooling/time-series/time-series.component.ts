import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-time-series',
  templateUrl: './time-series.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSeriesComponent extends BasePageComponent {}
