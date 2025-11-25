import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-order-flow',
  templateUrl: './order-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFlowComponent extends BasePageComponent {}
