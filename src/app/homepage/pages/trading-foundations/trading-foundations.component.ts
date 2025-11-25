import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-trading-foundations',
  templateUrl: './trading-foundations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingFoundationsComponent extends BasePageComponent {}
