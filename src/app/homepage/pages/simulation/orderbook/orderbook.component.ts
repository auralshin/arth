import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderbookComponent extends BasePageComponent {}
