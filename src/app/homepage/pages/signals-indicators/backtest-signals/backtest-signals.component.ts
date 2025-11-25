import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-backtest-signals',
  templateUrl: './backtest-signals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacktestSignalsComponent extends BasePageComponent {}
