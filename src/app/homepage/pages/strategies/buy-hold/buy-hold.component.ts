import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-buy-hold',
  templateUrl: './buy-hold.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyHoldComponent extends BasePageComponent {}
