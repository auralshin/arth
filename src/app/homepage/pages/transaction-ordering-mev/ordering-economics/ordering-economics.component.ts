import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ordering-economics',
  templateUrl: './ordering-economics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderingEconomicsComponent extends BasePageComponent {}
