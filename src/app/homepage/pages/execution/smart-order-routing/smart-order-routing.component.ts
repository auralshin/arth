import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-smart-order-routing',
  templateUrl: './smart-order-routing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartOrderRoutingComponent extends BasePageComponent {}
