import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-trading-foundations-spot-trading',
  templateUrl: './spot-trading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingFoundationsSpotTradingComponent extends BasePageComponent {}
