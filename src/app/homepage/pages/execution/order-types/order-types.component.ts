import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-order-types',
  templateUrl: './order-types.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTypesComponent extends BasePageComponent {}
