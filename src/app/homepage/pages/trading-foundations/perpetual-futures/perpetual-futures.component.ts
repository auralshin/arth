import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-trading-foundations-perpetual-futures',
  templateUrl: './perpetual-futures.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingFoundationsPerpetualFuturesComponent extends BasePageComponent {}
