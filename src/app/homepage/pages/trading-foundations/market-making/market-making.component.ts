import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-trading-foundations-market-making',
  templateUrl: './market-making.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingFoundationsMarketMakingComponent extends BasePageComponent {}
