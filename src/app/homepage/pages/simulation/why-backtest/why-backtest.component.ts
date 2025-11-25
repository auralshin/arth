import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-why-backtest',
  templateUrl: './why-backtest.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyBacktestComponent extends BasePageComponent {}
