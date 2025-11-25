import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-orderbooks-vs-amms',
  templateUrl: './orderbooks-vs-amms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderbooksVsAmmsComponent extends BasePageComponent {}
