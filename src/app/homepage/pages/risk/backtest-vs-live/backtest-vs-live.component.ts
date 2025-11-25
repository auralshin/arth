import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-backtest-vs-live',
  templateUrl: './backtest-vs-live.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacktestVsLiveComponent extends BasePageComponent {}
